import { stratify, tree as createTreeLayout } from "d3-hierarchy";

type Identifier = string;

type EmptyNode = {
    id: Identifier;
    type: "EMPTY_NODE";
    fams: string[];
    famc: string;
};

type PersonEvent = {
    date: {
        year: string;
        month: string;
        day: string;
    };
};

export type PersonNode = {
    id: Identifier;
    sex: "F" | "M";
    type: "PERSON_NODE";
    firstName: string;
    lastName: string;
    fams: string[];
    famc: string;
    color: string;
    nickName?: string;
    birth?: PersonEvent;
    death?: PersonEvent;
};

type Node = PersonNode | EmptyNode;

// type Person = {
//     id: Identifier;
//     type: "EMPTY_NODE" | "PERSON_NODE";
//     firstName: string;
//     lastName: string;
//     nickName?: string;
//     birth?: Event;
//     death?: Event;
// };

type Family = {
    id: Identifier;
    children: Identifier[];
};

type Connection = {
    id: Identifier;
    husb: string;
    wife: string;
    children: string[];
};

type Heritage = {
    people: Node[];
    relations: Connection[];
};

type FamilyTreeConstructor = {
    json: Heritage;
    personId: string | undefined;
};

export type D3Node = {
    id: Identifier;
    parentId: Identifier | null;
    person: Node;
    spouse: Node | null;
    family: Family | null;
};

// const GLOBAL_NODE_ID = "GLOBAL_NODE";

// Assumption: works given there is single root node.
function findEntryPersonNode(json: Heritage, entryPersonId: string | undefined) {
    if (!entryPersonId) {
        const rootNode = json.people.find((node) => !node.famc);
        if (!rootNode) {
            throw new Error("node not found");
        }
        return rootNode;
    }
    const rootNode = json.people.find((node) => node.id === entryPersonId);
    if (!rootNode) {
        throw new Error("node not found");
    }
    return rootNode;
}

function searchForNodeConnections(json: Heritage, nodeId: Identifier) {
    return json.relations.filter(
        (relation) => relation.husb === nodeId || relation.wife === nodeId,
    );
}

// function findChildren(json: Heritage, parentId: Identifier) {
//     const parent = json.people.find((person) => person.id === parentId);
//     if (!parent) {
//         throw new Error("Parent not found by id");
//     }
//     const parentRelations = parent.fams.map((familyId) => {
//         const family = json.relations.find((relation) => relation.id === familyId);
//         if (!family) {
//             throw new Error("Relation not found by id");
//         }
//         return family;
//     });
// }

// function createD3Node(node: Connection) {
//     return {
//         id: node.id,
//         parentId: node.famc,
//     };
// }

// function makeHashMapById<T extends { id: string | number }>(array: T[]) {
//     const newMap: Record<string, T> = {};
//     for (const element of array) {
//         newMap[element.id] = element;
//     }
//     return newMap;
// }

// function decorateNodeWithMembers(
//     nodeRef: D3Node,
//     members: Record<string, Node>,
//     connections: Record<string, Connection>,
// ) {
//     const node = structuredClone(nodeRef);
//     const family = connections[node.id];
//     if (!family) {

//     }
//     for (const child of family.children) {}
// }

// function makeDataD3Compliant(entryConnections: Connection[], json: Heritage) {
//     const d3ConnNodes: D3Node[] = [];
//     const stack = [];

//     const peopleMap = makeHashMapById(json.people);
//     const connectionsMap = makeHashMapById(json.relations);

//     if (entryConnections.length > 1) {
//         d3ConnNodes.push({ id: BOUNDY_NODE_ID, parentId: null });
//         for (const entryNode of entryConnections) {
//             d3ConnNodes.push({ id: entryNode.id, parentId: BOUNDY_NODE_ID });
//             stack.push({ id: entryNode.id, parentId: BOUNDY_NODE_ID });
//         }
//     } else if (entryConnections.length === 1) {
//         const entryConn = entryConnections.at(0);
//         if (!entryConn) {
//             throw new Error("no entry connection");
//         }
//         d3ConnNodes.push({ id: entryConn.id, parentId: null });
//         stack.push({ id: entryConn.id, parentId: BOUNDY_NODE_ID });
//     } else {
//         throw new Error("no entry node");
//     }

//     while (stack.length !== 0) {
//         const entry = stack.pop();

//         // decorateMembers
//         // findChildren

//         // d3ConnNodes.push
//     }
// }

// // avoid duplicates when related
// function createHierarchy(startingNode: Node) {
//     return null;
// }

// function draw() {
//     return null;
// }

// function drawFamily() {
//     return null;
// }

// function drawLink() {
//     return null;
// }

function createPeopleMap(json: Heritage) {
    const map = new Map<string, Node>();
    for (const person of json.people) {
        map.set(person.id, person);
    }
    return map;
}

function createConnectionsMap(json: Heritage) {
    const map = new Map<string, Connection>();
    for (const person of json.relations) {
        map.set(person.id, person);
    }
    return map;
}

function createPersonToConnectionsMap(json: Heritage) {
    const connections: Record<string, string[]> = {};
    for (const connection of json.relations) {
        if (connection.husb) {
            const currentConnection = connections[connection.husb];
            if (currentConnection) {
                currentConnection.push(connection.id);
            } else {
                connections[connection.husb] = [connection.id];
            }
        }
        if (connection.wife) {
            const currentConnection = connections[connection.wife];
            if (currentConnection) {
                currentConnection.push(connection.id);
            } else {
                connections[connection.wife] = [connection.id];
            }
        }
    }
    return connections;
}

function findPerson(map: Map<string, Node>, personId: Identifier): Node | null {
    const person = map.get(personId);
    if (!person) {
        return null;
    }
    return person;
}

function getPersonSpouseId(entryConnection: Connection, personId: Identifier) {
    if (entryConnection.husb === personId) {
        return entryConnection.wife;
    }
    return entryConnection.husb;
}

function getFamilies(personToFamilyMap: Record<string, string[]>, personId: Identifier) {
    const ownedFamilies = personToFamilyMap[personId];
    if (!ownedFamilies) {
        return [];
    }
    return ownedFamilies;
}

function findConnection(connectionsMap: Map<string, Connection>, connectionId: Identifier) {
    const connection = connectionsMap.get(connectionId);
    if (!connection) {
        return null;
    }
    return connection;
}

function parseDataForStratification(entryNode: Node, json: Heritage) {
    const nodes: D3Node[] = [];
    const stack: D3Node[] = [];

    // maps leading to higher memory usage but O(1) access complexity
    const addedAsSpouse = new Set();
    const personMap = createPeopleMap(json);
    const connectionMap = createConnectionsMap(json);
    const personToFamilyMap = createPersonToConnectionsMap(json);
    const spousesThatExistOnTree = [];

    const entryNodeConnections = searchForNodeConnections(json, entryNode.id);
    if (entryNodeConnections.length > 1) {
        // ToDo: new global node needs to be added
        throw new Error("unimplemented");
        // const newRootNode: D3Node = { id: GLOBAL_NODE_ID, parentId: null };
        // nodes.push(newRootNode);
        // stack.push(...entryNodeConnections); // but those connections need new parent assigned
    } else if (entryNodeConnections.length === 1) {
        const entryConnection = entryNodeConnections[0];
        if (!entryConnection) {
            throw new Error("no entry connection");
        }
        const person = findPerson(personMap, entryNode.id);
        if (!person) {
            throw new Error("person expected");
        }
        const entryPersonSpouseId = getPersonSpouseId(entryConnection, entryNode.id);
        stack.push({
            id: entryConnection.id,
            parentId: null,
            person,
            family: {
                id: entryConnection.id,
                children: entryConnection.children,
            },
            spouse: findPerson(personMap, entryPersonSpouseId),
        });
    } else {
        const person = findPerson(personMap, entryNode.id);
        if (!person) {
            throw new Error("person expected");
        }
        stack.push({
            id: entryNode.id,
            parentId: null,
            person,
            family: null,
            spouse: null,
        });
    }

    while (stack.length !== 0) {
        const entry = stack.pop();
        if (!entry) {
            throw new Error("undefined stack variable");
        }

        // Ignore is already added as spouse to avoid duplication
        const personAlreadyAdded = addedAsSpouse.has(entry.person.id);
        if (personAlreadyAdded) {
            spousesThatExistOnTree.push(entry.person);
            continue;
        }

        nodes.push(entry);

        if (!entry.family) {
            continue;
        }

        for (const childId of entry.family.children) {
            const person = findPerson(personMap, childId);
            if (!person) {
                throw new Error("person does not exist");
            }
            const childFamiliesIds = getFamilies(personToFamilyMap, childId);
            if (childFamiliesIds.length > 0) {
                for (const childFamilyId of childFamiliesIds) {
                    const connection = findConnection(connectionMap, childFamilyId);
                    if (!connection) {
                        throw new Error("connection not found");
                    }
                    const entryPersonSpouseId = getPersonSpouseId(connection, childId);
                    addedAsSpouse.add(entryPersonSpouseId);
                    stack.push({
                        id: connection.id,
                        parentId: entry.id,
                        person,
                        family: {
                            id: connection.id,
                            children: connection.children,
                        },
                        spouse: findPerson(personMap, entryPersonSpouseId),
                    });
                }
            } else {
                stack.push({
                    id: childId,
                    parentId: entry.id,
                    person,
                    family: null,
                    spouse: null,
                });
            }
        }
    }

    return nodes;
}

/**
 * @param json Json with all family data
 * @param personId Start drawing tree from person with specific id
 */
export function createFamilyTree({ json, personId }: FamilyTreeConstructor) {
    const entryNode = findEntryPersonNode(json, personId);
    const nodes = parseDataForStratification(entryNode, json);

    const stratifyOperator = stratify<D3Node>();
    // ToDo: Instead of parsing and using stratify operator I could write my own
    const treeDataset = stratifyOperator(nodes);
    // ToDo: setup node size .nodeSize([50, 50]) or size([2000, 2000]) or separation(() => 3)
    const createTree = createTreeLayout<D3Node>()
        .nodeSize([250, 150])
        .separation(() => 1);
    return createTree(treeDataset);
}
