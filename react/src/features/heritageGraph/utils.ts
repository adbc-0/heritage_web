import type { BlankPerson, HeritageRaw, RawPerson } from "@/types/heritage.types.ts";

export function searchPerson(heritage: HeritageRaw, personId: string) {
    return heritage.people.find((person) => person.id === personId);
}
export function searchFamily(heritage: HeritageRaw, familyId: string) {
    return heritage.relations.find((family) => family.id === familyId);
}
export function isPersonInvisible(person: RawPerson): person is BlankPerson {
    return person.type === "EMPTY_NODE";
}

// ToDo:
// tried to use clientHeight previously
// instead of 170 calculate paddings and margins and sizes
export function getCanvasSize(canvas: HTMLCanvasElement) {
    const canvasParent = canvas.parentElement;
    if (!canvasParent) {
        throw new Error("cannot set canvas size without parent");
    }

    const width = canvasParent.clientWidth;
    const height = window.innerHeight - 170;

    return { width, height };
}
