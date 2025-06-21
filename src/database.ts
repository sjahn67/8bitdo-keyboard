import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { IProgramConfig } from "./interface";

const PROGRAM_CONFIG_FILE_PATH = join(process.cwd(), "program-config.json");
const jsonFactory: IProgramConfig = {
    version: 1,
    name: "8bitdo-keyboard config file",
    values: {
        button0: 0,
        button1: "A",
        button2: "B"
    },
    gpio: {
        PIN_1: 20,
        PIN_2: 21
    }
}

export function getProgramConfig(): IProgramConfig {
    console.log("Database.getProgramVersion()");
    let json: string, jsonObject: IProgramConfig;
    try {
        json = readFileSync(PROGRAM_CONFIG_FILE_PATH, "utf8");
    } catch (e) {
        console.log("Config file could not found");
        saveProgramConfig(jsonFactory);
        return jsonFactory;
    }
    jsonObject = JSON.parse(json);
    return jsonObject;
};

export function saveProgramConfig(prConfig: IProgramConfig): boolean {
    console.log("Database.saveProgramConfig()");

    let json = JSON.stringify(prConfig, null, 2);
    try {
        writeFileSync(PROGRAM_CONFIG_FILE_PATH, json);
    } catch (error) {
        console.log("Save config error" + error);
        return false;
    }
    return true;
};
