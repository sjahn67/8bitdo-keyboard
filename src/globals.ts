import { getProgramConfig } from "./database";
import { IBigGlobal } from "./interface";

export const Big: IBigGlobal = {
    ProgramConfig: getProgramConfig()
}