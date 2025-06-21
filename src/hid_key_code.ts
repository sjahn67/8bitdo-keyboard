// keyboard_hid_codes.js
// general 키 (0x04 ~ 0x2C)
export const GEN_KEY = {
    // Letters
    A: 0x04,
    B: 0x05,
    C: 0x06,
    D: 0x07,
    E: 0x08,
    F: 0x09,
    G: 0x0A,
    H: 0x0B,
    I: 0x0C,
    J: 0x0D,
    K: 0x0E,
    L: 0x0F,
    M: 0x10,
    N: 0x11,
    O: 0x12,
    P: 0x13,
    Q: 0x14,
    R: 0x15,
    S: 0x16,
    T: 0x17,
    U: 0x18,
    V: 0x19,
    W: 0x1A,
    X: 0x1B,
    Y: 0x1C,
    Z: 0x1D,

    // Numbers (0x1E ~ 0x27)
    DIGIT_1: 0x1E, // 1!
    DIGIT_2: 0x1F, // 2@
    DIGIT_3: 0x20, // 3#
    DIGIT_4: 0x21, // 4$
    DIGIT_5: 0x22, // 5%
    DIGIT_6: 0x23, // 6^
    DIGIT_7: 0x24, // 7&
    DIGIT_8: 0x25, // 8*
    DIGIT_9: 0x26, // 9(
    DIGIT_0: 0x27, // 0)

    // Special Characters (0x28 ~ 0x52)
    ENTER: 0x28,
    ESCAPE: 0x29,
    BACKSPACE: 0x2A,
    TAB: 0x2B,
    SPACE: 0x2C,
    MINUS: 0x2D, // -_
    EQUAL: 0x2E, // :+
    LEFT_BRACKET: 0x2F, // [{
    RIGHT_BRACKET: 0x30, // ]}
    BACKSLASH: 0x31, // \|
    NON_US_HASH: 0x32, // Non-US # ~
    SEMICOLON: 0x33, // ;:
    QUOTE: 0x34, // '"
    GRAVE_ACCENT: 0x35, // `~
    COMMA: 0x36, // ,<
    PERIOD: 0x37, // .>
    SLASH: 0x38, // /?
    CAPS_LOCK: 0x39,

    // Function Keys (0x3A ~ 0x45)
    F1: 0x3A,
    F2: 0x3B,
    F3: 0x3C,
    F4: 0x3D,
    F5: 0x3E,
    F6: 0x3F,
    F7: 0x40,
    F8: 0x41,
    F9: 0x42,
    F10: 0x43,
    F11: 0x44,
    F12: 0x45,

    // Navigation and other keys (0x46 ~ 0x52)
    PRINT_SCREEN: 0x46,
    SCROLL_LOCK: 0x47,
    PAUSE: 0x48,
    INSERT: 0x49,
    HOME: 0x4A,
    PAGE_UP: 0x4B,
    DELETE: 0x4C,
    END: 0x4D,
    PAGE_DOWN: 0x4E,
    RIGHT_ARROW: 0x4F,
    LEFT_ARROW: 0x50,
    DOWN_ARROW: 0x51,
    UP_ARROW: 0x52,

    // Numeric Keypad (0x53 ~ 0x67)
    NUM_LOCK: 0x53,
    KP_SLASH: 0x54, // Keypad /
    KP_ASTERISK: 0x55, // Keypad *
    KP_MINUS: 0x56, // Keypad -
    KP_PLUS: 0x57, // Keypad +
    KP_ENTER: 0x58, // Keypad Enter
    KP_1: 0x59,
    KP_2: 0x5A,
    KP_3: 0x5B,
    KP_4: 0x5C,
    KP_5: 0x5D,
    KP_6: 0x5E,
    KP_7: 0x5F,
    KP_8: 0x60,
    KP_9: 0x61,
    KP_0: 0x62,
    KP_PERIOD: 0x63, // Keypad .
    NON_US_BACKSLASH: 0x64, // Non-US \
    APPLICATION: 0x65, // Application (Menu) key
    POWER: 0x66, // Power
    KP_EQUAL: 0x67, // Keypad =

};

export const MO_KEY = {
    // Modifier Keys (0xE0 ~ 0xE7) - 이들은 단독으로 사용되지 않고 다른 키와 조합됩니다.
    LEFT_CONTROL: 0x01,
    LEFT_SHIFT: 0x02,
    LEFT_ALT: 0x04,
    LEFT_WINDOWS: 0x08, // Windows Key, Command Key (Mac)
    RIGHT_CONTROL: 0x10,
    RIGHT_SHIFT: 0x20,
    RIGHT_ALT: 0x40,
    RIGHT_WINDOW: 0x80,
}


// 사용 예시
/*
const HID_KEY = require('./keyboard_hid_codes');

console.log(`Key A: ${HID_KEY.A.toString(16)}`); // a
console.log(`Key Enter: ${HID_KEY.ENTER.toString(16)}`); // 28
console.log(`Left Shift: ${HID_KEY.LEFT_SHIFT.toString(16)}`); // e1
*/