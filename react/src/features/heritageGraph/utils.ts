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

export function getCanvasSizeFromParent(canvas: HTMLCanvasElement) {
    const canvasParent = canvas.parentElement;
    if (!canvasParent) {
        throw new Error("cannot set canvas size without parent");
    }

    const width = canvasParent.clientWidth;
    const height = canvasParent.clientHeight;

    return { width, height };
}
