export interface IProgramConfig {
    version: number,
    name: string;
    values: {
        button0: number;
        button1: string;
        button2: string;
    }
    gpio: {
        PIN_1: number,
        PIN_2: number,
        PIN_3?: number,
        PIN_4?: number,
        PIN_5?: number,
        PIN_6?: number,
        PIN_7?: number,
        PIN_8?: number,
    }
}

export interface IBigGlobal {
    ProgramConfig: IProgramConfig;
}