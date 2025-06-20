const fs = require("node:fs");

let m = module.exports = {};

let fd = null;
m.open = function () {
    fd = fs.openSync(KEYBOARD_DEVICE, 'w');
}

m.close = function () {
    fs.closeSync(fd);
}

m.sendKey = function (modifier, keycode1, keycode2, pressed1, pressed2) {
    try {
        if (fd === null) {
            console.log("Device is not opend!");
            return;
        }
        // Key Press: [modifier, 0, keycode1, keycode2, keycode3, keycode4, keycode5, keycode6]
        const pressBuffer = Buffer.from([modifier, 0x00, pressed1 ? keycode1 : 0x00, pressed2 ? keycode2 : 0x00, 0x00, 0x00, 0x00, 0x00]);
        fs.writeSync(fd, pressBuffer);

        // Key Release: All keys released: [0, 0, 0, 0, 0, 0, 0, 0]
        const releaseBuffer = Buffer.from([0x00, 0x00, pressed1 ? 0x00 : keycode1, pressed2 ? 0x00 : keycode2, 0x00, 0x00, 0x00, 0x00]);
        fs.writeSync(fd, releaseBuffer);

    } catch (error) {
        console.error(`Key input error: ${error.message}. Ensure Raspberry Pi is configured as a gadget mode keyboard and Node.js has write permissions to the file.`);
    }
}

