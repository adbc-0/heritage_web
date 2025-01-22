type Event = {
    date: {
        year?: number;
        month?: number;
        day?: number;
    };
};
export type Indi = {
    id: string;
    firstName?: string;
    nickName?: string;
    lastName?: string;
    fams: string[];
    famc?: string;
    birth?: Event;
    death?: Event;
};
export type Fam = {
    id: string;
    husb?: string;
    wife?: string;
    children?: string[];
};
export type Heritage = {
    indis: Indi[];
    fams: Fam[];
};
