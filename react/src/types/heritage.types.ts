export type PersonIdentifier = string;

export type PersonEvent = {
    date: {
        year: number;
        month: number;
        day: number;
    };
};

type RawPersonBase = {
    id: PersonIdentifier;
    fams: string[];
    famc: string;
};

export type RawConnection = {
    id: PersonIdentifier;
    husb: string | null;
    wife: string | null;
    children: string[];
};

export type BlankPerson = RawPersonBase & {
    type: "EMPTY_NODE";
};

export type FullPerson = RawPersonBase & {
    sex: "F" | "M";
    type: "PERSON_NODE";
    firstName: string;
    lastName: string;
    color: string;
    nickName: string;
    birth?: PersonEvent;
    death?: PersonEvent;
    placeOfBirth?: string;
    placeOfDeath?: string;
};

export type RawPerson = FullPerson | BlankPerson;

export type HeritageRaw = {
    people: RawPerson[];
    relations: RawConnection[];
};
