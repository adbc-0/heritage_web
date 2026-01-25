import { useParams } from "react-router";

import { isNil } from "@/lib/utils";
import { useHeritage } from "@/features/heritageData/heritageContext";
import { searchFamily, searchPerson } from "@/features/heritageGraph/utils";

import { Section } from "./Section";
import { SectionWithLinks } from "./SectionWithLinks";

import type { FullPerson, HeritageRaw, RawConnection } from "@/types/heritage.types.ts";

type Params = {
    id: string;
};

function getParent(heritage: HeritageRaw, personId: string | null) {
    if (!personId) {
        return null;
    }
    const parent = searchPerson(heritage, personId);
    if (!parent) {
        return null;
    }
    if (parent.type === "EMPTY_NODE") {
        return null;
    }
    return parent;
}

function getParents(heritage: HeritageRaw, family?: RawConnection) {
    const parents = [];
    if (!family) {
        return [];
    }
    const father = getParent(heritage, family.husb);
    if (father) {
        parents.push(father);
    }
    const mother = getParent(heritage, family.wife);
    if (mother) {
        parents.push(mother);
    }
    return parents;
}

function getChildren(heritage: HeritageRaw, family?: RawConnection) {
    if (!family) {
        return [];
    }
    return family.children
        .map((childId) => searchPerson(heritage, childId))
        .filter((person) => person?.type === "PERSON_NODE");
}

function getPartnersOfPerson(person: FullPerson) {
    return function (heritage: HeritageRaw, families: RawConnection[]) {
        return families
            .map((family) => {
                if (family.husb === person.id) {
                    return family.wife;
                }
                if (family.wife === person.id) {
                    return family.husb;
                }
                throw new Error("could not properly return partner");
            })
            .filter((maybePersonId) => !isNil(maybePersonId))
            .map((personId) => {
                const person = searchPerson(heritage, personId);
                if (!person) {
                    throw new Error("could not find person");
                }
                if (person.type === "EMPTY_NODE") {
                    throw new Error("unexpected empty node");
                }
                return person;
            });
    };
}

function collectPersonDetails(heritage: HeritageRaw, invesigatedPerson: FullPerson) {
    const familyOfParents = searchFamily(heritage, invesigatedPerson.famc);

    const parents = getParents(heritage, familyOfParents);
    const siblings = getChildren(heritage, familyOfParents).filter((child) => child.id !== invesigatedPerson.id);
    const familiesOfPerson = invesigatedPerson.fams
        .map((familyId) => searchFamily(heritage, familyId))
        .filter((family) => !isNil(family));
    const children = familiesOfPerson.flatMap((family) => getChildren(heritage, family));
    const getPartners = getPartnersOfPerson(invesigatedPerson);
    const partners = getPartners(heritage, familiesOfPerson);

    return {
        parents,
        partners,
        siblings,
        children,
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

    const person = heritage.people.find((person) => person.id === id);
    if (!person) {
        throw new Error("investigated person not found");
    }

    if (person.type === "EMPTY_NODE") {
        throw new Error("investigated person is empty node");
    }

    const { children, parents, partners, siblings } = collectPersonDetails(heritage, person);

    return (
        <div>
            <Section person={person} />
            <SectionWithLinks title="Rodzice" people={parents} />
            <SectionWithLinks title="Rodzeństwo" people={siblings} />
            <SectionWithLinks title="Małżeństwo/Partnerstwo" people={partners} />
            <SectionWithLinks title="Dzieci" people={children} />
        </div>
    );
}
