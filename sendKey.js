const fs = require("fs");
const HID_KEY = require("./hid_key_code")
const KEYBOARD_DEVICE = "/dev/hidg0";
let m = module.exports = {};

let fd = null;
m.open = function () {
    fd = fs.openSync(KEYBOARD_DEVICE, 'w');
    return fd;
}

m.close = function () {
    fs.closeSync(fd);
}

m.sendKey = function (modiData, keyData) {
    try {
        if (fd === null) {
            console.log("Device is not opend!");
            return;
        }
        const report = [ 0, 0, 0, 0, 0, 0, 0, 0];

        let count = 0;
        keyData.forEach((key) => {
            report[0] = modiData;
            report[count +2] = HID_KEY.GEN_KEY[key];
            if(++count > 5) return;
        } )
        // Key Press: [modifier, 0, keycode1, keycode2, keycode3, keycode4, keycode5, keycode6]
        const reportBuffer = Buffer.from(report);
        console.log("Report buffer:", fd, reportBuffer);
        fs.writeSync(fd, reportBuffer);

    } catch (error) {
        console.error(`Key input error: ${error.message}. Ensure Raspberry Pi is configured as a gadget mode keyboard and Node.js has write permissions to the file.`);
    }
}

