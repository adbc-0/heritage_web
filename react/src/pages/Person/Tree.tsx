import { type Params, useParams } from "react-router";
import { ErrorBoundary } from "react-error-boundary";

import { isNil } from "@/lib/utils";
import { useHeritage } from "@/features/heritageData/heritageContext";
import { isPersonInvisible, searchFamily, searchPerson } from "@/features/heritageGraph/utils";
import { ErrorFallback, HeritageGraph } from "@/features/heritageGraph/HeritageGraph";

import { HeritageRaw } from "@/types/heritage.types";

function addParentWhenExists(heritage: HeritageRaw, parentId: string | null) {
    if (!parentId) {
        return [];
    }
    const parent = searchPerson(heritage, parentId);
    if (!parent) {
        throw new Error("no searched person");
    }
    return [parent];
}

function getParentId(heritage: HeritageRaw, personId: string) {
    const person = searchPerson(heritage, personId);
    if (!person) {
        throw new Error("no searched person");
    }

    const parentFamily = searchFamily(heritage, person.famc);
    if (!parentFamily) {
        return null;
    }

    // ToDo: Both families should be rendered
    const [parent] = [
        ...addParentWhenExists(heritage, parentFamily.husb),
        ...addParentWhenExists(heritage, parentFamily.wife),
    ].filter((person) => !isPersonInvisible(person));

    if (!parent) {
        return null;
    }
    return parent.id;
}

export function Tree() {
    const { id: personId } = useParams<Params>();
    const { heritage } = useHeritage();

    if (!heritage) {
        throw new Error("missing heritageData");
    }
    if (!personId) {
        throw new Error("missing person parameter");
    }

    const maybeParentId = getParentId(heritage, personId);
    const rootPerson = isNil(maybeParentId) ? personId : maybeParentId;

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <HeritageGraph rootPerson={rootPerson} highlightedPerson={personId} />
        </ErrorBoundary>
    );
}
