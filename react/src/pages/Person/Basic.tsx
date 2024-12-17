import { useParams } from "react-router";

import { useHeritage } from "@/contexts/heritageContext";
import { isPersonInvisible, searchPerson, serachFamily } from "@/utils/heritage";
import { Heritage, Indi } from "@/typescript/heritage";
import { PersonTableRow } from "@/typescript/person";
import { Section } from "./Section";
import { SectionWithLinks } from "./SectionWithLinks";

type Params = {
    id: string;
};

type BasicInfo = Indi & {
    father?: Indi;
    mother?: Indi;
    siblings: Indi[];
};

function getBasicPersonData(heritage: Heritage, personId: string) {
    const person = searchPerson(heritage, personId);
    if (!person) {
        throw new Error("expected to find person");
    }
    const basic: BasicInfo = {
        ...person,
        siblings: [],
    };
    if (!person.famc) {
        return basic;
    }
    const parents = serachFamily(heritage, person.famc);
    if (!parents) {
        return basic;
    }
    if (parents.husb) {
        const father = searchPerson(heritage, parents.husb);
        basic.father = father;
    }
    if (parents.wife) {
        const mother = searchPerson(heritage, parents.wife);
        basic.mother = mother;
    }
    parents.children
        ?.filter((sibling) => sibling !== personId)
        .forEach((siblingId) => {
            const sibling = searchPerson(heritage, siblingId);
            if (!sibling) {
                throw new Error("expected to find sibling");
            }
            basic.siblings.push(sibling);
        });
    return basic;
}

function getFullName({ firstName, lastName }: Indi) {
    return [firstName, lastName].join(" ");
}

function createTable(person: BasicInfo) {
    const basicInfoTable: PersonTableRow[] = [];
    const fatherTable: PersonTableRow[] = [];
    const motherTable: PersonTableRow[] = [];
    const siblingsTable: PersonTableRow[] = [];

    if (person.firstName) {
        basicInfoTable.push({
            id: person.id,
            name: "Imię",
            value: person.firstName,
        });
    }
    if (person.lastName) {
        basicInfoTable.push({
            id: person.id,
            name: "Nazwisko",
            value: person.lastName,
        });
    }
    if (person.birth?.date.year) {
        basicInfoTable.push({
            id: person.id,
            name: "Rok urodzenia",
            value: person.birth.date.year,
        });
    }
    if (person.death?.date.year) {
        basicInfoTable.push({
            id: person.id,
            name: "Rok śmierci",
            value: person.death.date.year,
        });
    }
    if (person.father) {
        if (!isPersonInvisible(person.father)) {
            fatherTable.push({
                id: person.father.id,
                name: "Imię i nazwisko",
                value: getFullName(person.father),
            });
        }
    }
    if (person.mother) {
        if (!isPersonInvisible(person.mother)) {
            motherTable.push({
                id: person.mother.id,
                name: "Imię i nazwisko",
                value: getFullName(person.mother),
            });
        }
    }
    person.siblings.forEach((sibling) => {
        if (!isPersonInvisible(sibling)) {
            siblingsTable.push({
                id: sibling.id,
                name: "Imię i nazwisko",
                value: getFullName(sibling),
            });
        }
    });
    return {
        basicInfoTable,
        fatherTable,
        motherTable,
        siblingsTable,
    };
}

export function Basic() {
    const { id } = useParams<Params>();
    const heritage = useHeritage();

    if (!id) {
        throw new Error("expected person id");
    }
    if (!heritage) {
        return null;
    }
    const person = getBasicPersonData(heritage, id);
    const table = createTable(person);

    return (
        <section className="mb-4">
            <Section title="Podstawowe informacje" rows={table.basicInfoTable} />
            <SectionWithLinks title="Ojciec" rows={table.fatherTable} />
            <SectionWithLinks title="Matka" rows={table.motherTable} />
            <SectionWithLinks title="Rodzeństwo" rows={table.siblingsTable} />
        </section>
    );
}
