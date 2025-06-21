/**
 * @file index.js
 * @brief 라즈베리파이 GPIO 입력을 받아 PC에 키보드 이벤트를 전송하는 Node.js 프로그램입니다.
 * *
 * 실행 방법:
 * `sudo node index.js`
 * (GPIO 및 HID 장치에 접근하려면 루트 권한이 필요할 수 있습니다.)
 */
import { Big } from "./globals";
// 'onoff' 라이브러리 임포트 (GPIO 제어용)
import { Gpio } from "onoff"
import { isNumber } from "lodash";
import { send } from "./sendKey";
import { initData } from "./app";
// --- 설정 ---

// GPIO 핀 정의
// 버튼이 눌렸을 때 LOW 신호를 보내고, 평소에는 PULL-UP되어 HIGH 상태인 버튼에 적합합니다.
// (예: 풀업 저항을 사용한 모멘터리 버튼)
const gpio = Big.ProgramConfig.gpio;
const addGpioValue = 512;
const GPIO_PIN_1 = gpio.PIN_1 + addGpioValue; // 예시: GPIO 17 (Pin 11)
const GPIO_PIN_2 = gpio.PIN_2 + addGpioValue; // 예시: GPIO 27 (Pin 13)


// GPIO 핀과 키 코드 매핑
const bValues = Big.ProgramConfig.values;
const keyMappings = {
    [GPIO_PIN_1]: bValues.button1,    // GPIO 17이 눌리면 'A' 키 입력
    [GPIO_PIN_2]: bValues.button2 // GPIO 27이 눌리면 'Space' 키 입력
};

// send keymapping data.
initData(GPIO_PIN_1, GPIO_PIN_2, keyMappings);

// --- 전역 변수 ---
const activeKeys = new Set(); // 현재 눌려있는 키들을 추적하는 Set
let hidDevice = null;

// --- HID 장치 및 GPIO 초기화 ---

// GPIO 핀 객체를 저장할 배열
const gpioInputs = {};

async function initialize() {
    try {
        // 1. HID 장치 찾기 및 열기
        hidDevice = send.open();
        console.log("Hid device:", hidDevice);

        if (!isNumber(hidDevice)) {
            console.error('오류: 라즈베리파이 USB HID 키보드 장치를 찾을 수 없습니다.');
            console.error('라즈베리파이가 USB HID 가젯 모드로 올바르게 설정되었는지 확인하세요.');
            process.exit(1);
        }

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
                console.log("bValues:", bValues, "activeKeys:", activeKeys);
                send.sendKey(bValues.button0, activeKeys);
            });
        }

        console.log('프로그램이 실행 중입니다. Ctrl+C를 눌러 종료하세요.');

    } catch (error) {
        console.error(`초기화 중 오류 발생: ${error}`);
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
        // writeHidReport(createHidReport([])); // 모든 키 해제
    }

    // HID 장치 닫기
    if (hidDevice) {
        try {
            send.close();
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
