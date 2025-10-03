import { useParams } from "react-router";

import { useHeritage } from "@/contexts/heritageContext";
import { isPersonInvisible, searchFamily, searchPerson } from "@/features/graph/utils";
import { Section } from "./Section";
import { SectionWithLinks } from "./SectionWithLinks";

import type { PersonTableRow } from "@/pages/Person/types.ts";
import type { HeritageRaw, FullPerson } from "@/types/heritage.types.ts";

type Params = {
    id: string;
};

type ExtendedPerson = FullPerson & {
    father?: FullPerson;
    mother?: FullPerson;
    siblings: FullPerson[];
};

function getBasicPersonData(heritage: HeritageRaw, personId: string) {
    const person = searchPerson(heritage, personId);
    if (!person) {
        throw new Error("expected to find person");
    }
    if (person.type === "EMPTY_NODE") {
        throw new Error("cannot display blank node");
    }
    const personWithExtraDetails: ExtendedPerson = {
        ...person,
        siblings: [],
    };
    if (!person.famc) {
        return personWithExtraDetails;
    }
    const parents = searchFamily(heritage, person.famc);
    if (!parents) {
        return personWithExtraDetails;
    }
    if (parents.husb) {
        const father = searchPerson(heritage, parents.husb);
        if (father) {
            if (father.type === "PERSON_NODE") {
                personWithExtraDetails.father = father;
            }
        }
    }
    if (parents.wife) {
        const mother = searchPerson(heritage, parents.wife);
        if (mother) {
            if (mother.type === "PERSON_NODE") {
                personWithExtraDetails.mother = mother;
            }
        }
    }
    parents.children
        .filter((sibling) => sibling !== personId)
        .forEach((siblingId) => {
            const sibling = searchPerson(heritage, siblingId);
            if (!sibling) {
                throw new Error("expected to find sibling");
            }
            if (sibling.type !== "EMPTY_NODE") {
                personWithExtraDetails.siblings.push(sibling);
            }
        });
    return personWithExtraDetails;
}

function getFullName({ firstName, lastName }: FullPerson) {
    return [firstName, lastName].join(" ");
}

function createTable(person: ExtendedPerson) {
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
    const { heritage } = useHeritage();

    if (!id) {
        throw new Error("expected person id");
    }
    if (!heritage) {
        return null;
    }

    // ToDo: Throw error on missing person
    const person = getBasicPersonData(heritage, id);
    const table = createTable(person);

    return (
        <section className="py-3">
            <Section title="Podstawowe informacje" rows={table.basicInfoTable} />
            <SectionWithLinks title="Ojciec" rows={table.fatherTable} />
            <SectionWithLinks title="Matka" rows={table.motherTable} />
            <SectionWithLinks title="Rodzeństwo" rows={table.siblingsTable} />
        </section>
    );
}
