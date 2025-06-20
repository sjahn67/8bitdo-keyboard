/**
 * @file index.js
 * @brief 라즈베리파이 GPIO 입력을 받아 PC에 키보드 이벤트를 전송하는 Node.js 프로그램입니다.
 *
 * 이 프로그램은 라즈베리파이가 USB HID 키보드로 설정되어 있을 때 동작합니다.
 * 'node-hid' 라이브러리를 사용하여 지정된 USB HID 키보드 장치에
 * HID 키보드 보고서를 작성함으로써 PC에 키 입력을 시뮬레이션합니다.
 *
 * 필수 전제 조건:
 * 1. 라즈베리파이 OS에서 USB HID 가젯 모드가 활성화되어 있어야 합니다.
 * (자세한 설정 방법은 이 문서의 상단 섹션을 참조하세요.)
 * 2. Node.js 및 'onoff', 'node-hid' 라이브러리가 라즈베리파이에 설치되어 있어야 합니다.
 * - 'node-hid' 설치 시 build-essential 및 Python 개발 도구가 필요할 수 있습니다.
 *
 * 실행 방법:
 * `sudo node index.js`
 * (GPIO 및 HID 장치에 접근하려면 루트 권한이 필요할 수 있습니다.)
 */

// 'onoff' 라이브러리 임포트 (GPIO 제어용)
const Gpio = require('onoff').Gpio;

const HID_KEY = require("./hid_key_code")

// --- 설정 ---

// GPIO 핀 정의
// 버튼이 눌렸을 때 LOW 신호를 보내고, 평소에는 PULL-UP되어 HIGH 상태인 버튼에 적합합니다.
// (예: 풀업 저항을 사용한 모멘터리 버튼)
const GPIO_PIN_1 = 17; // 예시: GPIO 17 (Pin 11)
const GPIO_PIN_2 = 27; // 예시: GPIO 27 (Pin 13)


// GPIO 핀과 키 코드 매핑
const keyMappings = {
    [GPIO_PIN_1]: HID_KEY.A,    // GPIO 17이 눌리면 'A' 키 입력
    [GPIO_PIN_2]: HID_KEY.B // GPIO 27이 눌리면 'Space' 키 입력
};

// 라즈베리파이 HID 가젯의 Vendor ID 및 Product ID
// pi_hid_keyboard.sh 스크립트에서 설정된 값과 일치해야 합니다.
const RPI_HID_VENDOR_ID = 0x1d6b;
const RPI_HID_PRODUCT_ID = 0x0104;

// --- 전역 변수 ---

let hidDevice = null; // node-hid HID 장치 객체
const activeKeys = new Set(); // 현재 눌려있는 키들을 추적하는 Set

// --- HID 보고서 생성 함수 ---

/**
 * 8바이트 HID 키보드 보고서를 생성합니다.
 * 보고서 형식:
 * Byte 0: Modifier keys (Ctrl, Shift, Alt, GUI)
 * Byte 1: Reserved (always 0)
 * Bytes 2-7: Up to 6 key codes of currently pressed keys
 *
 * @param {number[]} pressedKeys 현재 눌려있는 키 코드들의 배열
 * @returns {Buffer} 8바이트 HID 보고서 버퍼
 */
function createHidReport(pressedKeys) {
    const report = Buffer.alloc(8, 0x00); // 8바이트 버퍼를 0으로 초기화

    // Modifier Keys (Byte 0) - 여기서는 사용하지 않으므로 0
    // 예시: report[0] = 0x02; // Left Shift를 누른 상태

    // Reserved (Byte 1) - 항상 0
    report[1] = 0x00;

    // Key Codes (Bytes 2-7)
    // 최대 6개의 키 코드를 보고서에 포함
    for (let i = 0; i < Math.min(pressedKeys.length, 6); i++) {
        report[i + 2] = pressedKeys[i];
    }
    return report;
}

/**
 * HID 보고서를 HID 장치에 작성합니다.
 * @param {Buffer} report 작성할 HID 보고서 버퍼
 */
function writeHidReport(report) {
    if (!hidDevice) {
        console.error('오류: HID 장치가 초기화되지 않았습니다.');
        return;
    }
    try {
        // node-hid의 write 함수는 Buffer 또는 Array<number>를 받습니다.
        hidDevice.write(Array.from(report));
    } catch (err) {
        console.error(`HID 보고서 작성 중 오류 발생: ${err.message}`);
    }
}

// --- HID 장치 및 GPIO 초기화 ---

// GPIO 핀 객체를 저장할 배열
const gpioInputs = {};

async function initialize() {
    try {
        // 1. HID 장치 찾기 및 열기
        const devices = HID.devices();
        console.log("Hid devices:", devices);
        const rpiKeyboardDevice = devices.find(dev =>
            dev.vendorId === RPI_HID_VENDOR_ID &&
            dev.productId === RPI_HID_PRODUCT_ID
        );

        if (!rpiKeyboardDevice || !rpiKeyboardDevice.path) {
            console.error('오류: 라즈베리파이 USB HID 키보드 장치를 찾을 수 없습니다.');
            console.error('라즈베리파이가 USB HID 가젯 모드로 올바르게 설정되었는지 확인하세요.');
            // console.log('감지된 HID 장치 목록:', devices); // 디버깅용
            process.exit(1);
        }

        console.log(`USB HID 키보드 장치 감지: ${rpiKeyboardDevice.product} (경로: ${rpiKeyboardDevice.path})`);
        hidDevice = new HID.HID(rpiKeyboardDevice.path);
        console.log('HID 장치가 성공적으로 열렸습니다.');

        // 2. 각 GPIO 핀 설정 및 이벤트 리스너 설정
        for (const pin of Object.keys(keyMappings)) {
            const gpioPinNumber = parseInt(pin);
            const mappedKeyCode = keyMappings[gpioPinNumber];

            // GPIO 핀을 입력으로 설정하고, 풀업 저항을 활성화합니다.
            // 'both' 엣지 감지로, 누름(falling)과 떼기(rising) 모두 감지합니다.
            // activeLow: true는 핀 값이 0일 때 (GND와 연결) 논리적으로 HIGH로 간주하게 하여
            // 버튼 누름을 감지하기 쉽게 합니다. 하지만 실제 물리적 신호는 LOW입니다.
            // 여기서는 `value === 0`으로 물리적 LOW 신호를 직접 감지합니다.
            const gpio = new Gpio(gpioPinNumber, 'in', 'both', { activeLow: true });
            gpioInputs[gpioPinNumber] = gpio;

            console.log(`GPIO ${gpioPinNumber} (Key: ${mappedKeyCode}) 감지 시작.`);

            // 핀 상태 변화 감지 이벤트 리스너
            gpio.watch((err, value) => {
                if (err) {
                    console.error(`GPIO ${gpioPinNumber} 감지 중 오류 발생: ${err.message}`);
                    return;
                }

                const key = keyMappings[gpioPinNumber];

                if (value === 0) { // 버튼이 눌렸을 때 (물리적 LOW 신호)
                    console.log(`GPIO ${gpioPinNumber} (Key: ${key}) - 눌림`);
                    if (!activeKeys.has(key)) {
                        activeKeys.add(key);
                    }
                } else { // 버튼이 떼졌을 때 (물리적 HIGH 신호)
                    console.log(`GPIO ${gpioPinNumber} (Key: ${key}) - 떼어짐`);
                    if (activeKeys.has(key)) {
                        activeKeys.delete(key);
                    }
                }

                // 현재 눌려있는 모든 키들을 기반으로 HID 보고서 생성 및 전송
                writeHidReport(createHidReport(Array.from(activeKeys)));
            });
        }

        console.log('프로그램이 실행 중입니다. Ctrl+C를 눌러 종료하세요.');

    } catch (error) {
        console.error(`초기화 중 오류 발생: ${error.message}`);
        // 필요한 경우 추가 오류 처리 (예: 애플리케이션 종료)
        process.exit(1);
    }
}

// --- 프로그램 종료 처리 ---

/**
 * 프로그램이 종료될 때 GPIO 핀을 해제하고 HID 장치를 닫습니다.
 * 이 함수는 Ctrl+C (SIGINT)와 같은 종료 신호에 의해 호출됩니다.
 */
function cleanup() {
    console.log('\n프로그램을 종료합니다. GPIO 및 HID 장치 해제 중...');

    // 모든 GPIO 핀 해제
    for (const pin in gpioInputs) {
        if (gpioInputs[pin] && gpioInputs[pin].unexport) {
            gpioInputs[pin].unexport();
            console.log(`GPIO ${pin} 해제 완료.`);
        }
    }

    // 모든 키를 떼는 보고서 전송 (키 씹힘 방지)
    // hidDevice가 유효한 경우에만 보고서 전송 시도
    if (hidDevice) {
        writeHidReport(createHidReport([])); // 모든 키 해제
    }

    // HID 장치 닫기
    if (hidDevice) {
        try {
            hidDevice.close();
            console.log('HID 장치가 성공적으로 닫혔습니다.');
        } catch (err) {
            console.error(`HID 장치 닫는 중 오류 발생: ${err.message}`);
        }
    }
    process.exit(0); // 프로그램 종료
}

// Ctrl+C (SIGINT) 신호 감지
process.on('SIGINT', cleanup);

// 기타 종료 이벤트 처리 (예: SIGTERM)
process.on('SIGTERM', cleanup);

// 프로그램 초기화 시작
initialize();
require("./app");
