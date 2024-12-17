import { Heritage, Indi } from "@/typescript/heritage";

type TreeObject = {
    indiId: string;
    spouseIds?: string[];
    children?: TreeObject[];
};

export function composeTree(heritage: Heritage, rootPersonId: string) {
    function findChildren(personId: string) {
        return heritage.fams.filter((fam) => fam.husb === personId || fam.wife === personId);
    }

    function findSpouses(personId: string) {
        const spouses: string[] = [];
        const families = heritage.fams.filter(
            (fam) => fam.husb === personId || fam.wife === personId,
        );
        families.forEach((family) => {
            if (family.husb === personId) {
                if (family.wife) {
                    spouses.push(family.wife);
                }
            } else {
                if (family.husb) {
                    spouses.push(family.husb);
                }
            }
        });
        return spouses;
    }

    function nest(rootNode: TreeObject) {
        const children = findChildren(rootNode.indiId)
            .map((family) => family.children ?? [])
            .flat()
            .map((indi) => ({ indiId: indi }));
        rootNode.spouseIds = findSpouses(rootNode.indiId);
        rootNode.children = children;
        for (const child of children) {
            nest(child);
        }
    }

    const rootPerson = searchPerson(heritage, rootPersonId);
    if (!rootPerson) {
        throw new Error("root person not found");
    }

    const rootTreeNode: TreeObject = {
        indiId: rootPerson.id,
        children: [],
    };

    nest(rootTreeNode);

    return rootTreeNode;
}

export function decomposeTree(tree: TreeObject, heritage: Heritage) {
    const indis = new Set<string>();
    const fams = new Set<string>();

    function nest(tree: TreeObject) {
        indis.add(tree.indiId);
        tree.spouseIds?.forEach((spouseId) => indis.add(spouseId));
        if (tree.children?.length) {
            for (const child of tree.children) {
                nest(child);
            }
        }
    }

    nest(tree);

    const splicedIndis = Array.from(indis).map((indi) => {
        const person = searchPerson(heritage, indi);
        if (!person) {
            throw new Error("expected to find person");
        }
        return person;
    });
    splicedIndis.forEach((indi) => {
        const nFams = heritage.fams
            .filter((fam) => fam.husb === indi.id || fam.wife === indi.id)
            .map((f) => f.id)
            .flat();
        nFams.forEach((f) => {
            fams.add(f);
        });
    });
    const splicedFams = Array.from(fams).map((familyId) => {
        const family = serachFamily(heritage, familyId);
        if (!family) {
            throw new Error("expected to find person");
        }
        return family;
    });
    return {
        indis: splicedIndis,
        fams: splicedFams,
    };
}

export function removeChild(tree: TreeObject, personId: string): TreeObject | null {
    let deletedSubtree: TreeObject | null = null;
    if (!Array.isArray(tree.children)) {
        return null;
    }
    for (let i = 0; i < tree.children.length; i++) {
        const child = tree.children[i];
        if (!child) {
            throw new Error("child node is falsy");
        }
        if (child.indiId === personId) {
            const [removedChild] = tree.children.splice(i, 1);
            if (!removedChild) {
                throw new Error("removed child node is falsy");
            }
            --i;
            return removedChild;
        }
        deletedSubtree = removeChild(child, personId);
    }
    return deletedSubtree;
}

export function removeReferences(heritage: Heritage, personId: string) {
    const asChild = heritage.fams.find((fam) => fam.children?.includes(personId));
    if (asChild) {
        asChild.children = asChild.children?.filter((child) => child !== personId);
    }
}

// function collectIndisFromTree(tree: TreeObject, arr: string[] = []) {
//     arr.push(tree.indiId);
//     if (!tree.children) {
//         return [];
//     }
//     for (const child of tree.children) {
//         collectIndisFromTree(child, arr);
//     }
//     return arr;
// }

function familiesCleanup(newHeritage: Heritage) {
    newHeritage.indis.forEach((indi) => {
        const indiFamc = indi.famc;
        if (!indiFamc) {
            return;
        }
        const family = newHeritage.fams.find((f) => f.id === indiFamc);
        if (!family) {
            delete indi.famc;
            return;
        }
        if (family.children?.includes(indi.id)) {
            return;
        }
        delete indi.famc;
    });
}

const TreeType = {
    PARENT: "PARENT",
    PERSON: "PERSON",
};
type TreeTypeValues = (typeof TreeType)[keyof typeof TreeType];
type GetInitialPersonReturnType = {
    id: string;
    type: TreeTypeValues;
};
function getInitialPerson(heritage: Heritage, personId: string): GetInitialPersonReturnType {
    const person = searchPerson(heritage, personId);
    if (!person) {
        throw new Error("expected to find person");
    }
    if (!person.famc) {
        return { id: person.id, type: TreeType.PERSON };
    }
    const parents = serachFamily(heritage, person.famc);
    if (parents?.husb) {
        return { id: parents.husb, type: TreeType.PARENT };
    }
    if (parents?.wife) {
        return { id: parents.wife, type: TreeType.PARENT };
    }
    return { id: person.id, type: TreeType.PERSON };
}

export function transformDatasetForPerson(heritage: Heritage, personId: string) {
    const heritageCopy = structuredClone(heritage);
    const rootPerson = getInitialPerson(heritage, personId);
    const tree = composeTree(heritageCopy, rootPerson.id);
    if (rootPerson.type === TreeType.PARENT) {
        tree.children
            ?.filter((s) => s.indiId !== personId)
            .forEach((siblingId) => {
                removeChild(tree, siblingId.indiId);
                removeReferences(heritageCopy, siblingId.indiId);
            });
    }
    return decomposeTree(tree, heritageCopy);
}

export function transformHeritageDatasetForActiveBranches(
    heritage: Heritage,
    excludedBranches: string[],
) {
    const heritageCopy = structuredClone(heritage);
    const tree = composeTree(heritageCopy, "I1");
    excludedBranches.forEach((indiId) => {
        removeChild(tree, indiId);
        removeReferences(heritageCopy, indiId);
    });
    // handle Ozimki tree which has two main nodes
    if (excludedBranches.includes("I212")) {
        removeChild(tree, "I214");
        removeReferences(heritageCopy, "I214");
    }
    const decomposed = decomposeTree(tree, heritageCopy);
    familiesCleanup(decomposed);
    return decomposed;
}

export function searchPerson(heritage: Heritage, personId: string) {
    return heritage.indis.find((indi) => indi.id === personId);
}

export function serachFamily(heritage: Heritage, familyId: string) {
    return heritage.fams.find((fams) => fams.id === familyId);
}

export function isPersonInvisible(person: Indi) {
    return person.firstName === "DUMMY" && person.lastName === "NODE";
}
