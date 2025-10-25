import { type HierarchyPointNode, stratify, tree as createTreeLayout } from "d3-hierarchy";

import { isNil } from "@/lib/utils.ts";
import {
    HORIZONTAL_SPACE_BETWEEN_NODES,
    NODE_HEIGHT,
    NODE_WIDTH,
    VERTICAL_SPACE_BETWEEN_NODES,
} from "./constants";

import type { HeritageRaw, PersonEvent, PersonIdentifier } from "@/types/heritage.types.ts";

/** Wrote my own definition since I could not find one exported by library */
type D3Node = {
    id: PersonIdentifier;
    parentId: PersonIdentifier | null;
};

export type HeritageSVGNode = D3Node & {
    members: Person[];
    empty: boolean;
    treatedAsRemarriage: boolean;
};

type PersonConstructor = {
    id: PersonIdentifier;
    type: "EMPTY_NODE" | "PERSON_NODE";
    sex?: "F" | "M";
    firstName?: string;
    lastName?: string;
    nickName?: string;
    birthDate?: PersonEvent;
    deathDate?: PersonEvent;
    color?: string;
};

// ToDo: Create special error class for tree generation

class Person {
    readonly isFamily = false;
    id: PersonIdentifier;
    type: "EMPTY_NODE" | "PERSON_NODE";
    parent: Family | null = null;
    families = new Map<PersonIdentifier, Family>();
    children = new Map<PersonIdentifier, Person>();
    // later make nullable
    sex: "F" | "M" = "M";
    // later make nullable
    firstName = "";
    // later make nullable
    lastName = "";
    // later make nullable
    nickName = "";
    birthDate: PersonEvent | null = null;
    deathDate: PersonEvent | null = null;
    color = "#FFF";

    *[Symbol.iterator](): Iterator<Person> {
        yield this;
    }

    constructor({
        id,
        type,
        lastName,
        firstName,
        sex,
        nickName,
        birthDate,
        deathDate,
        color,
    }: PersonConstructor) {
        this.id = id;
        this.type = type;
        if (sex) {
            this.sex = sex;
        }
        if (firstName) {
            this.firstName = firstName;
        }
        if (lastName) {
            this.lastName = lastName;
        }
        if (nickName) {
            this.nickName = nickName;
        }
        if (birthDate) {
            this.birthDate = birthDate;
        }
        if (deathDate) {
            this.deathDate = deathDate;
        }
        if (color) {
            this.color = color;
        }
    }

    addFamily(family: Family) {
        this.families.set(family.id, family);
    }

    connectTo(family: Family) {
        this.parent = family;
    }

    addChild(child: Person) {
        this.children.set(child.id, child);
    }

    delete() {
        if (isNil(this.parent)) {
            throw new Error("Cannot remove root node. Person does not have parent.");
        }
        this.parent.children.delete(this.id);
        this.parent = null;
    }
}

class Family {
    readonly isFamily = true;
    id: PersonIdentifier;
    parents: Map<PersonIdentifier, Family>;
    members: Map<PersonIdentifier, Person>;
    children: Map<PersonIdentifier, Person>;
    treatedAsRemarriage = false;

    *[Symbol.iterator](): Iterator<Family | Person> {
        const visitedNodes = new Set<PersonIdentifier>(); // I presume to avoid duplication
        const stack = new Stack<Family | Person>();

        stack.push(this);

        while (!stack.isEmpty()) {
            const element = stack.pop();
            for (const child of element.children.values()) {
                if (child.families.size) {
                    for (const childFamily of child.families.values()) {
                        if (!visitedNodes.has(childFamily.id)) {
                            stack.push(childFamily);
                            visitedNodes.add(childFamily.id);
                        }
                    }
                } else {
                    stack.push(child);
                }
            }
            yield element;
        }
    }

    constructor(id: PersonIdentifier) {
        this.id = id;
        this.parents = new Map();
        this.members = new Map();
        this.children = new Map();
    }

    connectTo(family: Family) {
        this.parents.set(family.id, family);
    }

    addMember(member: Person) {
        this.members.set(member.id, member);
    }

    addChild(child: Person) {
        this.children.set(child.id, child);
    }

    deleteParent(parentId: PersonIdentifier) {
        // ToDo: also delete parent from person. Here parent is removed only from family
        const parent = this.parents.get(parentId);
        if (!parent) {
            throw new Error("not a parent of person");
        }
        parent.children.delete(this.id);
        this.parents.delete(parentId);
    }

    /** @description Remove person and their relationship with parents */
    delete(removedMember: PersonIdentifier, removedParent: PersonIdentifier) {
        const ancestors = this.parents.get(removedParent);
        if (!ancestors) {
            throw new Error("no parent");
        }
        ancestors.children.delete(removedMember);
        ancestors.members.values().forEach((parent) => parent.children.delete(removedMember));
        this.parents.delete(removedParent);

        const member = this.members.get(removedMember);
        if (!member) {
            throw new Error("no member");
        }
        member.parent = null;
    }
}

// make new lib file for this class
class Stack<T> {
    #items: T[] = [];

    pop() {
        const item = this.#items.pop();
        if (isNil(item)) {
            throw new Error("empty stack exception");
        }
        return item;
    }

    push(items: T) {
        this.#items.push(items);
    }

    isEmpty() {
        return this.#items.length === 0;
    }
}

type FamilyGraphOptions = {
    rootPerson?: PersonIdentifier | null;
    excludedPeople?: PersonIdentifier[];
};

// Directed Acyclic Graph (DAG) represents family
export class Graph {
    root: Family | Person;
    dataset: HeritageRaw;

    people = new Map<PersonIdentifier, Person>();
    families = new Map<PersonIdentifier, Family>();

    extraParentMap = new Map<PersonIdentifier, PersonIdentifier>();
    remarriageMap = new Map<PersonIdentifier, PersonIdentifier>();

    // ToDo: Collect info regarding interconnected nodes and remarriages
    // Ways to do that:
    //   Collect at the end
    // interconnected: { family: Family; parentFamily: Family }[] = [];
    // remarriages: { person: Person; family: Family }[] = [];

    constructor(dataset: HeritageRaw, options: FamilyGraphOptions = {}) {
        this.dataset = dataset;

        // steps:
        // createPeople()
        // createFamilies()
        // addSpouses()
        // addChildren()

        // create people
        for (const person of this.dataset.people) {
            if (person.type === "PERSON_NODE") {
                const newPerson = new Person({
                    id: person.id,
                    sex: person.sex,
                    firstName: person.firstName,
                    lastName: person.lastName,
                    nickName: person.nickName,
                    type: person.type,
                    birthDate: person.birth,
                    deathDate: person.death,
                    color: person.color,
                });
                this.people.set(newPerson.id, newPerson);
            } else if (person.type === "EMPTY_NODE") {
                const newPerson = new Person({
                    id: person.id,
                    type: person.type,
                    sex: "M",
                    firstName: "",
                    lastName: "",
                    nickName: "",
                });
                this.people.set(newPerson.id, newPerson);
            } else {
                throw new Error("type unhandled");
            }
        }

        // create families
        for (const family of this.dataset.relations) {
            const newFamily = new Family(family.id);
            // add person to family
            if (family.husb) {
                const member = this.people.get(family.husb);
                if (!member) {
                    throw new Error("person does not exist");
                }
                newFamily.addMember(member);
                member.addFamily(newFamily);
            }
            // add person to family
            if (family.wife) {
                const member = this.people.get(family.wife);
                if (!member) {
                    throw new Error("person does not exist");
                }
                newFamily.addMember(member);
                member.addFamily(newFamily);
            }
            /**
             * @SPEC 3.0
             * add children using document order
             * */
            for (const childId of family.children) {
                const child = this.people.get(childId);
                if (!child) {
                    throw new Error("person does not exist");
                }
                // add child to father if father exists
                if (family.husb) {
                    const member = this.people.get(family.husb);
                    if (!member) {
                        throw new Error("person does not exist");
                    }
                    member.addChild(child);
                }
                // add child to mother if mother exists
                if (family.wife) {
                    const member = this.people.get(family.wife);
                    if (!member) {
                        throw new Error("person does not exist");
                    }
                    member.addChild(child);
                }
                // connection part
                // add parent family to child
                child.connectTo(newFamily);
                // add child to family
                newFamily.addChild(child);
            }
            this.families.set(newFamily.id, newFamily);
        }

        // create hierarchy
        for (const family of this.families.values()) {
            const membersCount = family.members.size;
            if (membersCount <= 0) {
                throw new Error("family without members");
            } else if (membersCount === 1) {
                for (const member of family.members.values()) {
                    // if member does not have parent family then it's a root node
                    if (member.parent) {
                        // this info is not used anywhere
                        family.connectTo(member.parent);
                    }
                    // member.addFamily(family);
                }
            } else if (membersCount === 2) {
                // ToDo: Takes second member from family. Write logic depending on sex.
                for (const member of family.members.values()) {
                    // if member does not have parent family then it's a root node
                    // alternatively add both and pick one when listing
                    if (member.parent) {
                        family.connectTo(member.parent);
                    }
                    // member.addFamily(family);
                }
            } else if (membersCount > 2) {
                throw new Error("polyamorous relationships not supported");
            }
        }

        // user should be able to both set root person and filter out people
        if (options.rootPerson) {
            /**
             * @SPEC 1.1
             * root node can be changed
             * */
            const person = this.people.get(options.rootPerson);
            if (!person) {
                throw new Error("no person with given id");
            }
            if (person.families.size === 0) {
                person.parent = null;
                this.root = person;
            } else if (person.families.size === 1) {
                const family = person.families.values().next().value;
                if (!family) {
                    throw new Error("not implemented");
                }

                for (const parent of family.parents.values()) {
                    family.delete(person.id, parent.id);
                }

                this.root = family;

                const carriedOverFamilies = new Map();
                for (const node of this.root) {
                    if (node instanceof Family) {
                        carriedOverFamilies.set(node.id, node);
                    }
                }

                for (const node of this.root) {
                    if (node instanceof Family) {
                        if (node.parents.size > 1) {
                            for (const parent of node.parents.values()) {
                                if (!carriedOverFamilies.has(parent.id)) {
                                    node.parents.delete(parent.id);
                                }
                            }
                        }
                    }
                }
                // add extra deduplication?

                // // deduping everything
                // for (const node of this.root) {
                //     if (node instanceof Family) {
                //         for (const child of node.children.values()) {
                //             for (const childFamily of child.families.values()) {
                //                 if (childFamily.parents.size === 2) {
                //                     const removableParents = childFamily.parents
                //                         .values()
                //                         .filter((parent) => parent.id !== node.id);
                //                     for (const removableParent of removableParents) {
                //                         // remove also references from parents?
                //                         childFamily.parents.delete(removableParent.id);
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // }
            } else {
                throw new Error("not implemented");
            }
        } else {
            /**
             * @SPEC 1.0
             * person without parent is the root node
             * */
            // what if there are multiple nodes without parent. Should they be validated?
            // what if there is only person and no family?
            const person = this.people.values().find((personNode) => isNil(personNode.parent));
            if (!person) {
                throw new Error("no person with given id");
            }
            if (person.families.size === 0) {
                this.root = person;
            } else if (person.families.size === 1) {
                const family = person.families.values().next().value;
                if (!family) {
                    throw new Error("not implemented");
                }
                this.root = family;
            } else {
                throw new Error("not implemented");
            }
        }

        if (options.excludedPeople) {
            for (const filteredOutPerson of options.excludedPeople) {
                const removedPerson = this.people.get(filteredOutPerson);
                if (!removedPerson) {
                    throw new Error("no person with given id");
                }
                if (removedPerson.families.size === 0) {
                    removedPerson.delete();
                } else if (removedPerson.families.size === 1) {
                    // ToDo: Rewrite to work as in line 477
                    for (const removedPersonFamily of removedPerson.families.values()) {
                        /**
                         * @SPEC 4.1
                         * */
                        const stack = new Stack<Family>();

                        // detach excluded family from their parents
                        for (const removedPersonParent of removedPersonFamily.parents.values()) {
                            removedPersonFamily.delete(filteredOutPerson, removedPersonParent.id);
                        }

                        stack.push(removedPersonFamily);

                        while (!stack.isEmpty()) {
                            const element = stack.pop();
                            for (const child of element.children.values()) {
                                for (const childFamily of child.families.values()) {
                                    if (childFamily.parents.size > 1) {
                                        childFamily.delete(child.id, element.id);
                                    } else {
                                        stack.push(childFamily);
                                    }
                                }
                            }
                        }
                    }
                } else {
                    throw new Error("polygamous relationships not supported");
                }
            }
        }

        // dedupe nodes and handle extra parent
        // self note: deduping and handling extra parents should be separate process
        for (const node of this.root) {
            // one person cannot be connected to two different families
            if (node instanceof Family) {
                if (node.parents.size > 1) {
                    /**
                     * @SPEC 4.0
                     * when both have parents in the tree dedupe by joining woman to man
                     * when same-sex relationship take the first parent
                     * */
                    if (node.members.size === 2) {
                        const members = Array.from(node.members.values());
                        if (!members[0] || !members[1]) {
                            throw new Error("member does not exist");
                        }

                        const sameSexRelationship = members[0].sex === members[1].sex;
                        if (sameSexRelationship) {
                            const [randomParent] = node.parents.values();
                            if (!randomParent) {
                                throw new Error("Parent does not exist");
                            }
                            this.extraParentMap.set(node.id, randomParent.id);
                            node.deleteParent(randomParent.id);
                        } else {
                            const parents = Array.from(node.members.values());
                            const woman = parents.find((member) => member.sex === "F");
                            if (!woman) {
                                throw new Error("Cannot find woman in marriage");
                            }
                            if (!woman.parent) {
                                throw new Error("Woman parent is root node");
                            }
                            this.extraParentMap.set(node.id, woman.parent.id);
                            node.deleteParent(woman.parent.id);
                        }
                    } else {
                        throw new Error("Family with non-standard size");
                    }
                }
            }
        }

        // // collect the information before deduplication
        // const peopleWithMultipleMarriages = Array.from(
        //     this.people.values().filter((person) => person.families.size > 1),
        // );
        // for (const personWithMultipleMarriages of peopleWithMultipleMarriages) {
        //     const [originalMarriage, ...rest] = personWithMultipleMarriages.families.values();
        //     if (!originalMarriage) {
        //         throw new Error("no original marraige");
        //     }
        //     // const o = descendantHashMap.get(originalMarriage.id);
        //     for (const marriage of rest) {
        //         marriage.treatedAsRemarriage = true;
        //         this.remarriageMap.set(originalMarriage.id, marriage.id);
        //         // const m = descendantHashMap.get(marriage.id);
        //         // remarriedConnections.push({ from: o, to: m });
        //     }
        // }

        // handle remarriages
        const peopleWithMultipleMarriages = new Set<Person>();
        for (const node of this.root) {
            if (node instanceof Family) {
                for (const member of node.members.values()) {
                    if (member.families.size > 1) {
                        peopleWithMultipleMarriages.add(member);
                    }
                }
            }
        }

        for (const personWithMultipleMarriages of peopleWithMultipleMarriages.values()) {
            const [originalMarriage, ...rest] = personWithMultipleMarriages.families.values();
            if (!originalMarriage) {
                throw new Error("no original marraige");
            }
            for (const marriage of rest) {
                /**
                 * @SPEC 5.0
                 * marking additional marriages as remarriages
                 * */
                marriage.treatedAsRemarriage = true;
                this.remarriageMap.set(originalMarriage.id, marriage.id);
            }
        }
    }

    toList() {
        // does spreading affect performance?
        return [...this.root];
    }

    toD3() {
        function createSVGNodeFromFamily(node: Family) {
            const membersAreEmptyNodes = node.members
                .values()
                .every((member) => member.type === "EMPTY_NODE");
            return {
                id: node.id,
                // ToDo: takes first available parent. They should be already deduplicated. Deduplication makes sure children are assigned to proper parent
                parentId: node.parents.values().next().value?.id ?? null,
                members: Array.from(node.members.values()),
                treatedAsRemarriage: node.treatedAsRemarriage,
                // parentFamily: node.parents.values().next().value ?? null,
                empty: membersAreEmptyNodes,
            };
        }

        function createSVGNodeFromPerson(node: Person) {
            return {
                id: node.id,
                parentId: node.parent?.id ?? null,
                members: [node],
                treatedAsRemarriage: false,
                // parentFamily: node.parent,
                empty: node.type === "EMPTY_NODE",
            };
        }

        const svgList: HeritageSVGNode[] = this.toList().map((node) => {
            if (node instanceof Family) {
                return createSVGNodeFromFamily(node);
            } else if (node instanceof Person) {
                return createSVGNodeFromPerson(node);
            } else {
                throw new Error("unexpected type");
            }
        });

        const stratifyOperator = stratify<HeritageSVGNode>();
        const treeDataset = stratifyOperator(svgList);
        const createTree = createTreeLayout<HeritageSVGNode>()
            .nodeSize([
                NODE_WIDTH * 2 + HORIZONTAL_SPACE_BETWEEN_NODES,
                NODE_HEIGHT + VERTICAL_SPACE_BETWEEN_NODES,
            ])
            .separation(() => 0.48);
        const descendants = createTree(treeDataset).descendants();

        const descendantHashMap = new Map<PersonIdentifier, HierarchyPointNode<HeritageSVGNode>>();
        for (const descendant of descendants) {
            if (!descendant.id) {
                throw new Error("descendant without id");
            }
            descendantHashMap.set(descendant.id, descendant);
        }

        const extraParents: {
            from: HierarchyPointNode<HeritageSVGNode>;
            to: HierarchyPointNode<HeritageSVGNode>;
        }[] = [];
        for (const [childId, extraParentId] of this.extraParentMap.entries()) {
            const child = descendantHashMap.get(childId);
            const extraParent = descendantHashMap.get(extraParentId);
            if (!child) {
                throw new Error("child not found");
            }
            if (!extraParent) {
                throw new Error("parent not found");
            }
            extraParents.push({ from: child, to: extraParent });
        }

        const remarriages: {
            from: HierarchyPointNode<HeritageSVGNode>;
            to: HierarchyPointNode<HeritageSVGNode>;
        }[] = [];
        for (const [originalMarriageId, remarriageId] of this.remarriageMap.entries()) {
            const originalMarriage = descendantHashMap.get(originalMarriageId);
            const remarriage = descendantHashMap.get(remarriageId);
            if (!originalMarriage) {
                throw new Error("originalMarriage not found");
            }
            if (!remarriage) {
                throw new Error("remarriage not found");
            }
            remarriages.push({ from: originalMarriage, to: remarriage });
        }

        return {
            descendants,
            extraParents,
            remarriages,
        };
    }
}

// const root = new TreeNode("A");
// const b = new TreeNode("B");
// const c = new TreeNode("C");
// const d = new TreeNode("D");
// const e = new TreeNode("E");
// const f = new TreeNode("F");
// const g = new TreeNode("G");
// root.addChild(b);
// root.addChild(c);
// root.addChild(d);
// b.addChild(e);
// b.addChild(f);
// d.addChild(g);
//
// console.log("--- Depth-First Search (DFS) Traversal ---");
// for (const node of root) {
//     console.log(node.value);
// }
// // Expected DFS output: A, B, E, F, C, D, G
//
// console.log("\n--- Breadth-First Search (BFS) Traversal ---");
// for (const node of root.bfsIterator()) {
//     console.log(node.value);
// }
// // Expected BFS output: A, B, C, D, E, F, G

// export class TreeBuilder {
//     #rootNode: Identifier | null;
//     #filteredNodes: Identifier[];
//
//     constructor() {
//         this.#rootNode = null;
//         this.#filteredNodes = [];
//     }
//
//     filterOut(filteredOut: Identifier[]) {
//         this.#filteredNodes = filteredOut;
//         return this;
//     }
//
//     subtree(newRootNode: Identifier) {
//         this.#rootNode = newRootNode;
//         return this;
//     }
//
//     get rootNode() {
//         return this.#rootNode;
//     }
//
//     get filteredNodes() {
//         return this.#filteredNodes;
//     }
// }
