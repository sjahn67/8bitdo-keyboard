const fs = require("node:fs");

let m = module.exports = {};

m.sendKey = function sendkey(modifier, keycode) {
    try {
        const fd = fs.openSync(KEYBOARD_DEVICE, 'w');

        // Key Press: [modifier, 0, keycode1, keycode2, keycode3, keycode4, keycode5, keycode6]
        const pressBuffer = Buffer.from([modifier, 0x00, keycode, 0x00, 0x00, 0x00, 0x00, 0x00]);
        fs.writeSync(fd, pressBuffer);

        // Key Release: All keys released: [0, 0, 0, 0, 0, 0, 0, 0]
        const releaseBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        fs.writeSync(fd, releaseBuffer);

        fs.closeSync(fd);
    } catch (error) {
        console.error(`Key input error: ${error.message}. Ensure Raspberry Pi is configured as a gadget mode keyboard and Node.js has write permissions to the file.`);
    }
}