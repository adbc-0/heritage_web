// ToDo: Add # to internal only methods and properties
import { type HierarchyPointNode, stratify, tree as createTreeLayout } from "d3-hierarchy";

import { isNil } from "@/lib/utils.ts";
import { Stack } from "@/features/heritage/stack.ts";
import {
    HORIZONTAL_SPACE_BETWEEN_NODES,
    NODE_HEIGHT,
    NODE_WIDTH,
    VERTICAL_SPACE_BETWEEN_NODES,
} from "@/features/heritageGraph/constants.ts";

import type { HeritageRaw, PersonEvent, PersonIdentifier, RawConnection } from "@/types/heritage.types.ts";

/** Wrote my own definition since I could not find one exported by library */
type D3Node = {
    id: PersonIdentifier;
    parentId: PersonIdentifier | null;
};

export type SVGPersonDetails = {
    id: PersonIdentifier;
    firstName: string;
    lastName: string;
    color: string;
    nickName: string;
    birthDate: PersonEvent | null;
    deathDate: PersonEvent | null;
    parent: Family | null;
};

export type HeritageSVGNode = D3Node & {
    members: SVGPersonDetails[];
    empty: boolean;
    treatedAsRemarriage: boolean;
};

export const PersonType = {
    EMPTY_NODE: "EMPTY_NODE",
    PERSON_NODE: "PERSON_NODE",
} as const;
export type PersonTypeType = (typeof PersonType)[keyof typeof PersonType];

export const Sex = {
    M: "M",
    F: "F",
} as const;
export type SexType = (typeof Sex)[keyof typeof Sex];

// consider making two different classes depending on type
interface PersonDetails {
    id: PersonIdentifier;
    type: PersonTypeType;
    firstName?: string;
    lastName?: string;
    nickName?: string;
    sex?: SexType;
    birthDate?: PersonEvent | null;
    deathDate?: PersonEvent | null;
    color?: string;
}

const WHITE = "#FFF;";

class GraphError extends Error {}

class Person {
    readonly id: PersonIdentifier;
    readonly type: PersonTypeType;

    parent: Family | null = null;
    families = new Map<PersonIdentifier, Family>();
    children = new Map<PersonIdentifier, Person>();

    readonly sex: SexType;
    readonly firstName;
    readonly lastName;
    readonly nickName;
    readonly birthDate: PersonEvent | null;
    readonly deathDate: PersonEvent | null;
    readonly color;

    *[Symbol.iterator](): Iterator<Person> {
        yield this;
    }

    constructor({
        id,
        type,
        lastName = "",
        firstName = "",
        sex = Sex.M,
        nickName = "",
        birthDate = null,
        deathDate = null,
        color = WHITE,
    }: PersonDetails) {
        this.id = id;
        this.type = type;
        this.sex = sex;
        this.firstName = firstName;
        this.lastName = lastName;
        this.nickName = nickName;
        this.birthDate = birthDate;
        this.deathDate = deathDate;
        this.color = color;
    }

    attachFamily(family: Family) {
        this.families.set(family.id, family);
    }

    attachParentFamily(family: Family) {
        this.parent = family;
    }

    addChild(child: Person) {
        this.children.set(child.id, child);
    }

    detachParentFamily() {
        if (isNil(this.parent)) {
            throw new GraphError("Cannot remove root node. Person does not have parent.");
        }
        this.parent.children.delete(this.id);
        this.parent = null;
    }
}

class Family {
    readonly id: PersonIdentifier;

    parents = new Map<PersonIdentifier, Family>();
    members = new Map<PersonIdentifier, Person>();
    children = new Map<PersonIdentifier, Person>();
    remarriageStatus = false;

    /**
     * @description Depth-First Search (DFS) Traversal
     * Allows to list over family with for of loops
     * Expected DFS output: A, B, E, F, C, D, G
     */
    *[Symbol.iterator](): Iterator<Family | Person> {
        /**
         * Avoid visiting the same node multiple times through
         * Two different people can have the same family
         */
        const visitedNodes = new Set<PersonIdentifier>();
        const stack = new Stack<Family | Person>();

        stack.push(this);

        while (!stack.isEmpty()) {
            const node = stack.pop();
            for (const child of node.children.values()) {
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
            yield node;
        }
    }

    constructor(id: PersonIdentifier) {
        this.id = id;
    }

    attachParentFamily(family: Family) {
        this.parents.set(family.id, family);
    }

    addMember(member: Person) {
        this.members.set(member.id, member);
    }

    addChild(child: Person) {
        this.children.set(child.id, child);
    }

    /**
     @description Detach parent family
     Parent is still attached directly to family member (person).
     */
    softDetachParentFamily(parentId: PersonIdentifier) {
        const ancestor = this.parents.get(parentId);
        if (!ancestor) {
            throw new GraphError("no parent with given parent id");
        }
        ancestor.children.delete(this.id);
        this.parents.delete(parentId);
    }

    /**
     * @description Detach parent family
     * Parent is detached from child also on Person level.
     */
    detachParentFamily(removedMember: PersonIdentifier, removedParent: PersonIdentifier) {
        const ancestor = this.parents.get(removedParent);
        if (!ancestor) {
            throw new GraphError("no parent with given parent id");
        }
        ancestor.children.delete(removedMember);
        ancestor.members.values().forEach((parent) => parent.children.delete(removedMember));
        this.parents.delete(removedParent);

        const member = this.members.get(removedMember);
        if (!member) {
            throw new GraphError("no family member with given person id");
        }
        member.parent = null;
    }
}

interface GraphOptions {
    rootPerson?: PersonIdentifier | null;
    excludedPeople?: PersonIdentifier[];
}

/**
 * @description Directed Acyclic Graph storing family data.
 */
export class Graph {
    root: Family | Person;
    dataset: HeritageRaw;

    people = new Map<PersonIdentifier, Person>();
    families = new Map<PersonIdentifier, Family>();

    // all cases where person has two parents from different houses
    multiHouseMap = new Map<PersonIdentifier, PersonIdentifier>();
    // all remarriages could be listed as second node and later merged. More in line with real structure.
    remarriageMap = new Map<PersonIdentifier, PersonIdentifier>();

    #addPerson(newPerson: Person) {
        this.people.set(newPerson.id, newPerson);
    }

    #addFamily(newFamily: Family) {
        this.families.set(newFamily.id, newFamily);
    }

    #addMembers(newFamily: Family, relation: RawConnection) {
        if (relation.husb) {
            const member = this.people.get(relation.husb);
            if (!member) {
                throw new GraphError("person does not exist");
            }
            newFamily.addMember(member);
            member.attachFamily(newFamily);
        }
        if (relation.wife) {
            const member = this.people.get(relation.wife);
            if (!member) {
                throw new GraphError("person does not exist");
            }
            newFamily.addMember(member);
            member.attachFamily(newFamily);
        }
    }

    #addChildToParents(child: Person, relation: RawConnection) {
        if (relation.husb) {
            const member = this.people.get(relation.husb);
            if (!member) {
                throw new GraphError("person does not exist");
            }
            member.addChild(child);
        }
        if (relation.wife) {
            const member = this.people.get(relation.wife);
            if (!member) {
                throw new GraphError("person does not exist");
            }
            member.addChild(child);
        }
    }

    #addChildren(newFamily: Family, relation: RawConnection) {
        /**
         * @SPEC 3.0
         * add children using document order
         * */
        for (const childId of relation.children) {
            const child = this.people.get(childId);
            if (!child) {
                throw new GraphError("person does not exist");
            }
            this.#addChildToParents(child, relation);
            child.attachParentFamily(newFamily);
            newFamily.addChild(child);
        }
    }

    #createPeople() {
        for (const person of this.dataset.people) {
            if (person.type === PersonType.PERSON_NODE) {
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
                this.#addPerson(newPerson);
            } else if (person.type === PersonType.EMPTY_NODE) {
                const newEmptyPerson = new Person({ id: person.id, type: person.type });
                this.#addPerson(newEmptyPerson);
            } else {
                throw new GraphError("person type not supported");
            }
        }
    }

    #createFamilies() {
        for (const relation of this.dataset.relations) {
            const newFamily = new Family(relation.id);
            this.#addMembers(newFamily, relation);
            this.#addChildren(newFamily, relation);
            this.#addFamily(newFamily);
        }
    }

    #findNodeWithoutParent() {
        const person = this.people.values().find((personNode) => isNil(personNode.parent));
        if (!person) {
            throw new GraphError("person without a parent does not exist");
        }
        return person;
    }

    /**
     * @SPEC 1.0
     * person without parent is the root node
     * @SPEC 1.1
     * root node can be changed
     * */
    #getRootNode(rootPersonId?: string | null) {
        if (rootPersonId == null) {
            const root = this.#findNodeWithoutParent();
            if (root.families.size === 0) {
                return root;
            }
            if (root.families.size === 1) {
                const [rootFamily] = root.families.values();
                if (!rootFamily) {
                    throw new GraphError("index out of bounds");
                }
                return rootFamily;
            }
            // ToDo: Create and append new node at the top
            throw new GraphError("multi-parent root not implemented");
        }
        const root = this.people.get(rootPersonId);
        if (!root) {
            throw new GraphError("could not find person with given id");
        }
        if (root.families.size === 0) {
            return root;
        }
        if (root.families.size === 1) {
            const [rootFamily] = root.families.values();
            if (!rootFamily) {
                throw new GraphError("index out of bounds");
            }
            return rootFamily;
        }
        // ToDo: Create and append new node at the top
        throw new GraphError("multi-parent root not implemented");
    }

    #setHierarchy() {
        for (const family of this.families.values()) {
            for (const member of family.members.values()) {
                if (member.parent) {
                    family.attachParentFamily(member.parent);
                }
            }
        }
    }

    #removeLinkToNonDescendants() {
        // remove parent connection from new root
        if (this.root instanceof Person) {
            const rootPerson = this.root;
            rootPerson.parent = null;
            return;
        }

        // remove parent connection from new root
        const rootFamily = this.root;
        for (const member of rootFamily.members.values()) {
            for (const parent of rootFamily.parents.values()) {
                rootFamily.detachParentFamily(member.id, parent.id);
            }
        }

        const descendants = new Map<PersonIdentifier, Family>();
        for (const node of this.root) {
            if (node instanceof Family) {
                descendants.set(node.id, node);
            }
        }

        // remove second parent coming from "external" part of the tree
        for (const node of this.root) {
            if (node instanceof Family) {
                if (node.parents.size > 1) {
                    for (const parent of node.parents.values()) {
                        if (!descendants.has(parent.id)) {
                            node.parents.delete(parent.id);
                        }
                    }
                }
            }
        }
    }

    #disconnectExcludedNodes(excluded: string[]) {
        for (const filteredOutPerson of excluded) {
            const removedPerson = this.people.get(filteredOutPerson);
            if (!removedPerson) {
                throw new GraphError("no person with given id");
            }
            if (removedPerson.families.size === 0) {
                removedPerson.detachParentFamily();
            } else if (removedPerson.families.size === 1) {
                // ToDo: Rewrite to work as in line 477
                for (const removedPersonFamily of removedPerson.families.values()) {
                    /**
                     * @SPEC 4.1
                     * */
                    const stack = new Stack<Family>();

                    // detach excluded family from their parents
                    for (const removedPersonParent of removedPersonFamily.parents.values()) {
                        removedPersonFamily.detachParentFamily(filteredOutPerson, removedPersonParent.id);
                    }

                    stack.push(removedPersonFamily);

                    // going through all removed person descendants and removing multi parent connections
                    while (!stack.isEmpty()) {
                        const element = stack.pop();
                        for (const child of element.children.values()) {
                            for (const childFamily of child.families.values()) {
                                if (childFamily.parents.size > 1) {
                                    childFamily.detachParentFamily(child.id, element.id);
                                } else {
                                    stack.push(childFamily);
                                }
                            }
                        }
                    }
                }
            } else {
                throw new GraphError("polygamous relationships not supported");
            }
        }
    }

    #handleDeduplication() {
        // dedupe nodes and handle extra parent
        // self note: deduping and handling extra parents should be a separate process
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
                            throw new GraphError("member does not exist");
                        }

                        const sameSexRelationship = members[0].sex === members[1].sex;
                        if (sameSexRelationship) {
                            const [randomParent] = node.parents.values();
                            if (!randomParent) {
                                throw new GraphError("Parent does not exist");
                            }
                            this.multiHouseMap.set(node.id, randomParent.id);
                            node.softDetachParentFamily(randomParent.id);
                        } else {
                            const parents = Array.from(node.members.values());
                            const woman = parents.find((member) => member.sex === "F");
                            if (!woman) {
                                throw new GraphError("Cannot find woman in marriage");
                            }
                            if (!woman.parent) {
                                throw new GraphError("Woman parent is root node");
                            }
                            this.multiHouseMap.set(node.id, woman.parent.id);
                            node.softDetachParentFamily(woman.parent.id);
                        }
                    } else {
                        throw new GraphError("Family with non-standard size");
                    }
                }
            }
        }
    }

    #collectRemarriages() {
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
                throw new GraphError("no original marriage");
            }
            for (const marriage of rest) {
                /**
                 * @SPEC 5.0
                 * marking additional marriages as remarriages
                 * */
                marriage.remarriageStatus = true;
                this.remarriageMap.set(originalMarriage.id, marriage.id);
            }
        }
    }

    constructor(dataset: HeritageRaw, options: GraphOptions = {}) {
        this.dataset = dataset;

        this.#createPeople();
        this.#createFamilies();

        this.#setHierarchy();

        this.root = this.#getRootNode(options.rootPerson);
        if (options.rootPerson) {
            this.#removeLinkToNonDescendants();
        }

        if (options.excludedPeople) {
            this.#disconnectExcludedNodes(options.excludedPeople);
        }

        this.#handleDeduplication();

        this.#collectRemarriages();
    }

    toList() {
        return [...this.root];
    }

    toD3() {
        function createSVGNodeFromFamily(node: Family) {
            const membersAreEmptyNodes = node.members.values().every((member) => member.type === "EMPTY_NODE");
            return {
                id: node.id,
                // ToDo: takes first available parent. They should be already deduplicated. Deduplication makes sure children are assigned to proper parent
                parentId: node.parents.values().next().value?.id ?? null,
                members: Array.from(node.members.values()),
                treatedAsRemarriage: node.remarriageStatus,
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
                throw new GraphError("unexpected type");
            }
        });

        const stratifyOperator = stratify<HeritageSVGNode>();
        const treeDataset = stratifyOperator(svgList);
        const createTree = createTreeLayout<HeritageSVGNode>()
            .nodeSize([NODE_WIDTH * 2 + HORIZONTAL_SPACE_BETWEEN_NODES, NODE_HEIGHT + VERTICAL_SPACE_BETWEEN_NODES])
            .separation(() => 0.48);
        const descendants = createTree(treeDataset).descendants();

        const descendantHashMap = new Map<PersonIdentifier, HierarchyPointNode<HeritageSVGNode>>();
        for (const descendant of descendants) {
            if (!descendant.id) {
                throw new GraphError("descendant without id");
            }
            descendantHashMap.set(descendant.id, descendant);
        }

        const extraParents: {
            from: HierarchyPointNode<HeritageSVGNode>;
            to: HierarchyPointNode<HeritageSVGNode>;
        }[] = [];
        for (const [childId, extraParentId] of this.multiHouseMap.entries()) {
            const child = descendantHashMap.get(childId);
            const extraParent = descendantHashMap.get(extraParentId);
            if (!child) {
                throw new GraphError("child not found");
            }
            if (!extraParent) {
                throw new GraphError("parent not found");
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
                throw new GraphError("originalMarriage not found");
            }
            if (!remarriage) {
                throw new GraphError("remarriage not found");
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
