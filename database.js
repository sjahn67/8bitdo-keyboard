const path = require("node:path");
const fs = require("node:fs");

let m = module.exports = {}

const PROGRAM_CONFIG_FILE_PATH = path.join(__dirname, "program-config.json");
const jsonFactory = {
    name: "Big-keyboard config file",
    values: {
        button0: "None",
        button1: "A",
        button2: "B"
    }
}

m.getProgramConfig = function () {
    console.log("Database.getProgramVersion()");
    let json, jsonObject;
    try {
        json = fs.readFileSync(PROGRAM_CONFIG_FILE_PATH, "utf8");
    } catch (e) {
        console.log("Config file could not found");
        json = jsonFactory;
        this.saveProgramConfig(json);
        return json;
    }
    jsonObject = JSON.parse(json);
    return jsonObject;
};

m.saveProgramConfig = function (prConfig) {
    console.log("Database.saveProgramConfig()");

    let json = JSON.stringify(prConfig, null, 2);
    try {
        fs.writeFileSync(PROGRAM_CONFIG_FILE_PATH, json);
    } catch (error) {
        console.log("Save config error" + error);
        return false;
    }
    return true;
};
