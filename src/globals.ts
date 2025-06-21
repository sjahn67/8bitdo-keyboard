import { getProgramConfig } from "./database";
import { IBigGlobal } from "./interface";

export const _8BitDo: IBigGlobal = {
    ProgramConfig: getProgramConfig()
}