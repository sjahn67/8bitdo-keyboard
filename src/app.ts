import express, { Request, Response, NextFunction, Router } from "express";
import bodyParser from 'body-parser';
import { join } from "node:path";
const app = express();
import { GEN_KEY, MO_KEY } from "./hid_key_code";
const hid_gen_key_names = Object.keys(GEN_KEY);
const hid_mo_key_names = Object.keys(MO_KEY);
hid_mo_key_names.splice(0, 0, "None");
const port = 3000;
import { getProgramConfig, saveProgramConfig } from "./database";
import { Big } from "./globals";

// global valiable...
let buttonValues = Big.ProgramConfig.values;

let GPIO_PIN_1 = null;
let GPIO_PIN_2 = null;
let KEY_MAPPINGS = null;

export function initData(gpio_pin_1, gpio_pin_2, keyMappings) {
    GPIO_PIN_1 = gpio_pin_1;
    GPIO_PIN_2 = gpio_pin_2;
    KEY_MAPPINGS = keyMappings;
}

function setNewKey() {
    KEY_MAPPINGS[GPIO_PIN_1] = buttonValues.button1;
    KEY_MAPPINGS[GPIO_PIN_2] = buttonValues.button2;
}

// 드롭다운에 사용할 값 목록을 함수로 정의
// 이 함수는 문자열 배열을 반환합니다.
function getDropdownOptions(): string[] {
    return hid_gen_key_names;
}

function getModifierOptions(): string[] {
    return hid_mo_key_names;
}

// 미들웨어 설정
app.use(bodyParser.json()); // JSON 형태의 요청 본문 파싱
app.use(bodyParser.urlencoded({ extended: true })); // URL-encoded 형태의 요청 본문 파싱

// 정적 파일 서빙 (HTML, CSS, 클라이언트 JavaScript 파일들이 있는 폴더)
app.use(express.static(join(__dirname, "..", 'public')));

// 초기 값 및 드롭다운 옵션 요청 API
app.get('/api/initial-data', (req: Request, res: Response) => {
    res.json({
        buttonValues: buttonValues,
        dropdownOptions: getDropdownOptions(), // send dropdown
        dropdownModiOptions: getModifierOptions()
    });
});

// 값 업데이트 API
app.post('/api/update-value', (req: any, res: any) => {
    console.log("/api/update-value");
    const { buttonId, newValue } = req.body;
    console.log("id:", buttonId, "new value:", newValue);

    // 받아온 값이 드롭다운 옵션에 유효한 값인지 검증 (선택 사항이지만 권장)
    if (buttonId === "button0") {
        // const validOptions = getModifierOptions();
        // if (!validOptions.includes(newValue)) {
        //     return res.status(400).json({ success: false, message: 'Invalid value selected.' });
        // }
    } else {
        const validOptions = getDropdownOptions();
        if (!validOptions.includes(newValue)) {
            return res.status(400).json({ success: false, message: 'Invalid value selected.' });
        }
    }

    if (buttonId in buttonValues) {
        buttonValues[buttonId] = newValue; // 숫자로 변환
        console.log(`Updated ${buttonId} to: ${buttonValues[buttonId]}`);
        saveProgramConfig(Big.ProgramConfig);
        setNewKey();
        res.json({ success: true, newValues: buttonValues });
    } else {
        res.status(400).json({ success: false, message: 'Invalid button ID' });
    }
});

// 단일 API: 버튼 이벤트 처리 (눌림/떨어짐)
app.post('/api/button-event', (req: any, res: any) => {
    const { eventType, buttonId, eventKey, currentValue } = req.body;
    console.log(`Received Button Event: Type: ${eventType}, Button ID: ${buttonId}, Event Key: ${eventKey}, Current Value: ${currentValue}`);

    // 여기에 이벤트 타입에 따른 서버 측 로직을 구현합니다.
    // 예시:
    if (eventType === 'down') {
        console.log(`[DOWN EVENT] Processing for ${buttonId}`);
        // 특정 down 이벤트 처리 로직
    } else if (eventType === 'up') {
        console.log(`[UP EVENT] Processing for ${buttonId}`);
        // 특정 up 이벤트 처리 로직
    } else {
        console.warn(`Unknown event type: ${eventType}`);
        return res.status(400).json({ success: false, message: 'Unknown event type.' });
    }

    res.json({ success: true, message: `Button ${eventType} event received and processed.` });
});

// 서버 시작
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});