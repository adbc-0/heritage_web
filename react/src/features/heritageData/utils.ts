import { isNil } from "@/lib/utils";
import { FullPerson } from "@/types/heritage.types";

export function getPersonName(person: FullPerson) {
    let name = person.firstName;
    if (person.nickName) {
        name += ` "${person.nickName}"`;
    }
    return name;
}

export function getPersonDates(person: FullPerson): string {
    if (isNil(person.birth) && isNil(person.death)) {
        return "";
    }
    return `${person.birth?.date.year} - ${person.death?.date.year}`;
}
