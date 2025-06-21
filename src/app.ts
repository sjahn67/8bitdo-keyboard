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
import { send, activeKeys} from "./sendKey";

// global variable...
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

// Defines a function to list values for dropdowns
// This function returns an array of strings.
function getDropdownOptions(): string[] {
    return hid_gen_key_names;
}

function getModifierOptions(): string[] {
    return hid_mo_key_names;
}

// Middleware setup
app.use(bodyParser.json()); // Parse JSON-formatted request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Serve static files (folder containing HTML, CSS, client-side JavaScript files)
app.use(express.static(join(__dirname, "..", 'public')));

// API for requesting initial values and dropdown options
app.get('/api/initial-data', (req: Request, res: Response) => {
    res.json({
        buttonValues: buttonValues,
        dropdownOptions: getDropdownOptions(), // send dropdown
        dropdownModiOptions: getModifierOptions()
    });
});

// API for updating values
app.post('/api/update-value', (req: any, res: any) => {
    console.log("/api/update-value");
    const { buttonId, newValue } = req.body;
    console.log("id:", buttonId, "new value:", newValue);

    // Validate if the received value is valid for dropdown options (optional but recommended)
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
        buttonValues[buttonId] = newValue; // Convert to number
        console.log(`Updated ${buttonId} to: ${buttonValues[buttonId]}`);
        saveProgramConfig(Big.ProgramConfig);
        setNewKey();
        res.json({ success: true, newValues: buttonValues });
    } else {
        res.status(400).json({ success: false, message: 'Invalid button ID' });
    }
});

// Single API: Handle button events (press/release)
app.post('/api/button-event', (req: any, res: any) => {
    const { eventType, buttonId, eventKey, currentValue } = req.body;
    console.log(`Received Button Event: Type: ${eventType}, Button ID: ${buttonId}, Event Key: ${eventKey}, Current Value: ${currentValue}`);

    // Implement server-side logic based on event type here.
    // Example:
    if (eventType === 'down') {
        console.log(`[DOWN EVENT] Processing for ${buttonId}`);
        // Specific down event processing logic
        if (!activeKeys.has(buttonValues[buttonId])) {
            activeKeys.add(buttonValues[buttonId]);
        }
        if (!activeKeys.has(buttonValues[buttonId])) {
            activeKeys.add(buttonValues[buttonId]);
        }
    } else if (eventType === 'up') {
        console.log(`[UP EVENT] Processing for ${buttonId}`);
        // Specific up event processing logic
        if (activeKeys.has(buttonValues[buttonId])) {
            activeKeys.delete(buttonValues[buttonId]);
        }

    } else {
        console.warn(`Unknown event type: ${eventType}`);
        return res.status(400).json({ success: false, message: 'Unknown event type.' });
    }
    console.log("bValues:",buttonValues, "activeKeys:", activeKeys);
    send.sendKey(buttonValues.button0, activeKeys);

    res.json({ success: true, message: `Button ${eventType} event received and processed.` });
});

// Start server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});