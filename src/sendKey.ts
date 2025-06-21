import { openSync, closeSync, writeSync } from "node:fs";
import { GEN_KEY } from "./hid_key_code";
const KEYBOARD_DEVICE = "/dev/hidg0";

export const activeKeys = new Set(); // 현재 눌려있는 키들을 추적하는 Set

export class SendKey {
    protected fd: number = null;

    public open(): number {
        this.fd = openSync(KEYBOARD_DEVICE, 'w');
        return this.fd;
    }

    public close() {
        closeSync(this.fd);
    }

    public sendKey = function (modiData: number, keyData: Set<unknown>) {
        try {
            if (this.fd === null) {
                console.log("Device is not opend!");
                return;
            }
            const report: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

            let count = 0;
            keyData.forEach((key) => {
                report[0] = modiData;
                report[count + 2] = GEN_KEY[key as string];
                if (++count > 5) return;
            })
            // Key Press: [modifier, 0, keycode1, keycode2, keycode3, keycode4, keycode5, keycode6]
            const reportBuffer = Buffer.from(report);
            console.log("Report buffer:", this.fd, reportBuffer);
            writeSync(this.fd, reportBuffer);

        } catch (error) {
            console.error(`Key input error: ${error.message}. Ensure Raspberry Pi is configured as a gadget mode keyboard and Node.js has write permissions to the file.`);
        }
    }
}

export const send = new SendKey();