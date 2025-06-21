/**
 * @file index.ts
 * @brief This Node.js program receives Raspberry Pi GPIO input and sends keyboard events to a PC.
 * *
 * How to run:
 * `sudo node ./dist/index.js`
 * (You may have root privilige to access HID device )
 */
import { Big } from "./globals";
// Import 'onoff' library (for GPIO control)
import { Gpio } from "onoff"
import { isNumber } from "lodash";
import { send } from "./sendKey";
import { initData } from "./app";
// --- Configuration ---

// GPIO pin definition
// Suitable for buttons that send a LOW signal when pressed and are normally PULL-UP to a HIGH state.
// (e.g., a momentary button with a pull-up resistor)
const gpio = Big.ProgramConfig.gpio;
const addGpioValue = 512;
const GPIO_PIN_1 = gpio.PIN_1 + addGpioValue; // Example: GPIO 17 (Pin 11)
const GPIO_PIN_2 = gpio.PIN_2 + addGpioValue; // Example: GPIO 27 (Pin 13)


// Map GPIO pins to key codes
const bValues = Big.ProgramConfig.values;
const keyMappings = {
    [GPIO_PIN_1]: bValues.button1,      // If GPIO 17 is pressed, 'A' key input
    [GPIO_PIN_2]: bValues.button2       // If GPIO 27 is pressed, 'Space' key input
};

// send keymapping data.
initData(GPIO_PIN_1, GPIO_PIN_2, keyMappings);

// --- Global Variables ---
const activeKeys = new Set(); // Set to track currently pressed keys
let hidDevice = null;

// --- HID Device and GPIO Initialization ---

// Array to store GPIO pin objects
const gpioInputs = {};

async function initialize() {
    try {
        // 1. Find and open HID device
        hidDevice = send.open();
        console.log("Hid device:", hidDevice);

        if (!isNumber(hidDevice)) {
            console.error('Error: Could not find Raspberry Pi USB HID keyboard device.');
            console.error('Please ensure your Raspberry Pi is correctly configured in USB HID gadget mode.');
            process.exit(1);
        }

        // 2. Configure each GPIO pin and set up event listeners
        for (const pin of Object.keys(keyMappings)) {
            const gpioPinNumber = parseInt(pin);
            const mappedKeyCode = keyMappings[gpioPinNumber];

            // Set GPIO pin as input and enable pull-up resistor.
            // Detect both edges ('both') for press (falling) and release (rising).
            // activeLow: true makes the pin value 0 (connected to GND) logically considered HIGH,
            // making it easier to detect button presses. However, the actual physical signal is LOW.
            // Here, we directly detect the physical LOW signal with `value === 0`.
            const gpio = new Gpio(gpioPinNumber, 'in', 'both', { activeLow: true });
            gpioInputs[gpioPinNumber] = gpio;

            console.log(`Starting detection on GPIO ${gpioPinNumber} (Key: ${mappedKeyCode}).`);

            // Event listener to detect pin state changes
            gpio.watch((err, value) => {
                if (err) {
                    console.error(`Error detecting GPIO ${gpioPinNumber}: ${err.message}`);
                    return;
                }

                const key = keyMappings[gpioPinNumber];

                if (value === 0) { // When the button is pressed (physical LOW signal)
                    console.log(`GPIO ${gpioPinNumber} (Key: ${key}) - Pressed`);
                    if (!activeKeys.has(key)) {
                        activeKeys.add(key);
                    }
                } else { // When the button is released (physical HIGH signal)
                    console.log(`GPIO ${gpioPinNumber} (Key: ${key}) - Released`);
                    if (activeKeys.has(key)) {
                        activeKeys.delete(key);
                    }
                }

                // Generate and send HID report based on all currently pressed keys
                console.log("bValues:", bValues, "activeKeys:", activeKeys);
                send.sendKey(bValues.button0, activeKeys);
            });
        }

        console.log('Program is running. Press Ctrl+C to exit.');

    } catch (error) {
        console.error(`Error during initialization: ${error}`);
        process.exit(1);
    }
}

// --- Program Termination Handling ---

/**
 * Releases GPIO pins and closes the HID device when the program terminates.
 * This function is called by termination signals like Ctrl+C (SIGINT).
 */
function cleanup() {
    console.log('\nTerminating program. Releasing GPIO and HID devices...');

    // Release all GPIO pins
    for (const pin in gpioInputs) {
        if (gpioInputs[pin] && gpioInputs[pin].unexport) {
            gpioInputs[pin].unexport();
            console.log(`GPIO ${pin} released.`);
        }
    }

    // Send a report to release all keys (to prevent sticky keys)
    // Attempt to send report only if hidDevice is valid
    if (hidDevice) {
        // writeHidReport(createHidReport([])); // Release all keys
    }

    // Close HID device
    if (hidDevice) {
        try {
            send.close();
            console.log('HID device closed successfully.');
        } catch (err) {
            console.error(`Error closing HID device: ${err.message}`);
        }
    }
    process.exit(0); // Terminate program
}

// Detect Ctrl+C (SIGINT) signal
process.on('SIGINT', cleanup);

// Handle other termination events (e.g., SIGTERM)
process.on('SIGTERM', cleanup);

// Start program initialization
initialize();