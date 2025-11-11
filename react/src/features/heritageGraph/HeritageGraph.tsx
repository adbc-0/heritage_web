import { type ComponentRef, useEffect, useRef } from "react";
import { OctagonAlertIcon } from "lucide-react";
import { Link } from "react-router";
import { zoom, zoomIdentity } from "d3-zoom";
import { select } from "d3-selection";
import { type HierarchyPointNode } from "d3-hierarchy";

import { RouterPath } from "@/constants/routePaths.ts";
import { isNil } from "@/lib/utils.ts";
import { useHeritage } from "@/features/heritageData/heritageContext";

import { NODE_BASE_WIDTH, NODE_HEIGHT, NODE_SIZE_FACTOR, VERTICAL_SPACE_BETWEEN_NODES } from "./constants";
import { Graph, type HeritageSVGNode, type SVGPersonDetails } from "./graph";

import type { PersonEvent } from "@/types/heritage.types";

type FamilyGraphComponent = {
    rootPerson?: string;
    inactiveBranches?: string[];
    highlightedPerson?: string;
};

type StartingPosition = {
    x: number;
    y: number;
};

function getParentAnchor(parent: HierarchyPointNode<HeritageSVGNode>) {
    if (parent.data.members.length === 1) {
        return { x: 0, y: 0 };
    } else if (parent.data.members.length === 2) {
        const [, personOnLeft] = Array.from(parent.data.members.values()).toSorted();
        if (isNil(personOnLeft)) {
            throw new Error("partner not found");
        }
        const nodeCenter = parent.data.width / 2;
        return { x: (personOnLeft.width - nodeCenter) * NODE_SIZE_FACTOR, y: 0 };
    } else {
        throw new Error("polygamy not handled");
    }
}

function getPersonAnchor(person: HierarchyPointNode<HeritageSVGNode>, parent: HierarchyPointNode<HeritageSVGNode>) {
    if (person.data.members.length === 1) {
        return { x: 0, y: 0 };
    } else if (person.data.members.length === 2) {
        const [secondPartner, firstPartner] = Array.from(person.data.members.values()).toSorted();
        if (isNil(firstPartner)) {
            throw new Error("partner not found");
        }
        if (isNil(secondPartner)) {
            throw new Error("partner not found");
        }
        if (isNil(firstPartner.parent) && isNil(secondPartner.parent)) {
            throw new Error("partner parent not found");
        }
        if (firstPartner.parent?.id === parent.id) {
            const personCenter = firstPartner.width / 2;
            const nodeCenter = person.data.width / 2;
            return { x: (personCenter - nodeCenter) * NODE_SIZE_FACTOR - NODE_BASE_WIDTH / 2, y: 0 };
        }
        if (secondPartner.parent?.id === parent.id) {
            const personCenter = firstPartner.width + secondPartner.width / 2;
            const nodeCenter = person.data.width / 2;
            return { x: (personCenter - nodeCenter) * NODE_SIZE_FACTOR + NODE_BASE_WIDTH / 2, y: 0 };
        }
        throw new Error("parent id does not match child id");
    } else {
        throw new Error("polygamy not handled");
    }
}

function drawExtraParentLine(child: HierarchyPointNode<HeritageSVGNode>, parent: HierarchyPointNode<HeritageSVGNode>) {
    const personAnchor = getPersonAnchor(child, parent);
    const parentAnchor = getParentAnchor(parent);
    return (
        "M " +
        (parent.x + parentAnchor.x).toString() +
        " " +
        parent.y.toString() +
        " L " +
        (parent.x + parentAnchor.x).toString() +
        " " +
        (child.y - VERTICAL_SPACE_BETWEEN_NODES / 2 + 10).toString() +
        " " +
        (child.x + personAnchor.x).toString() +
        " " +
        (child.y - VERTICAL_SPACE_BETWEEN_NODES / 2 + 10).toString() +
        " " +
        (child.x + personAnchor.x).toString() +
        " " +
        child.y.toString()
    );
}

/** @description Draw line from center of the parent to the center of the child. Even if child is in family. */
function drawLine(child: HierarchyPointNode<HeritageSVGNode>, parent: HierarchyPointNode<HeritageSVGNode>) {
    const personAnchor = getPersonAnchor(child, parent);
    const parentAnchor = getParentAnchor(parent);
    return (
        "M " +
        (parent.x + parentAnchor.x).toString() +
        " " +
        parent.y.toString() +
        " L " +
        (parent.x + parentAnchor.x).toString() +
        " " +
        (child.y - VERTICAL_SPACE_BETWEEN_NODES / 2).toString() +
        " " +
        (child.x + personAnchor.x).toString() +
        " " +
        (child.y - VERTICAL_SPACE_BETWEEN_NODES / 2).toString() +
        " " +
        (child.x + personAnchor.x).toString() +
        " " +
        child.y.toString()
    );
}

function connectionKey(connection: {
    from: HierarchyPointNode<HeritageSVGNode>;
    to: HierarchyPointNode<HeritageSVGNode>;
}) {
    if (isNil(connection.from.id)) {
        throw new Error("missing source id");
    }
    if (isNil(connection.to.id)) {
        throw new Error("missing target id");
    }
    return `${connection.from.id} + ${connection.to.id}`;
}

function ChildToExtraParentLink(connection: {
    from: HierarchyPointNode<HeritageSVGNode>;
    to: HierarchyPointNode<HeritageSVGNode>;
}) {
    return (
        <path
            d={drawExtraParentLine(connection.from, connection.to)}
            fill="none"
            stroke="#797979"
            strokeWidth="1px"
            strokeDasharray={4}
            shapeRendering="optimizeSpeed"
        />
    );
}

function drawRemarriageLine(from: HierarchyPointNode<HeritageSVGNode>, to: HierarchyPointNode<HeritageSVGNode>) {
    return (
        "M " +
        from.x.toString() +
        " " +
        (from.y + NODE_HEIGHT / 2).toString() +
        " L " +
        to.x.toString() +
        " " +
        (to.y + NODE_HEIGHT / 2).toString()
    );
}

function RemarriageLink(connection: {
    from: HierarchyPointNode<HeritageSVGNode>;
    to: HierarchyPointNode<HeritageSVGNode>;
}) {
    return (
        <path
            d={drawRemarriageLine(connection.from, connection.to)}
            fill="none"
            stroke="#797979"
            strokeWidth="1px"
            strokeDasharray={4}
            shapeRendering="optimizeSpeed"
        />
    );
}

function ChildToParentLink({ node }: { node: HierarchyPointNode<HeritageSVGNode> }) {
    if (!node.parent) {
        return null;
    }
    if (node.parent.data.empty) {
        return null;
    }
    if (node.data.treatedAsRemarriage) {
        return null;
    }
    return (
        <path
            d={drawLine(node, node.parent)}
            fill="none"
            stroke="#797979"
            strokeWidth="1px"
            shapeRendering="optimizeSpeed"
        />
    );
}

function eventToString(event: PersonEvent | null) {
    if (!event) {
        return "";
    }
    return event.date.year.toString();
}

function birthAndDeath(birthEvent: PersonEvent | null, deathEvent: PersonEvent | null) {
    if (isNil(birthEvent) && isNil(deathEvent)) {
        return "";
    }
    return `${eventToString(birthEvent)} - ${eventToString(deathEvent)}`;
}

function getPersonName(person: SVGPersonDetails) {
    let name = person.firstName;
    if (person.nickName) {
        name += ` "${person.nickName}"`;
    }
    return name;
}

function Node({ node }: { node: HierarchyPointNode<HeritageSVGNode> }) {
    if (node.data.empty) {
        return null;
    }
    if (node.data.members.length === 1) {
        const [person] = Array.from(node.data.members.values());
        if (!person) {
            throw new Error("no person");
        }
        const personWidth = person.width * NODE_SIZE_FACTOR + NODE_BASE_WIDTH;
        const centerNode = node.x - personWidth / 2;
        return (
            <g transform={`translate(${centerNode.toString()},${node.y.toString()})`}>
                <Link to={`${RouterPath.OSOBY}/${person.id}`}>
                    <rect
                        fill={person.color}
                        strokeWidth={1}
                        stroke="#797979"
                        width={personWidth}
                        height={NODE_HEIGHT}
                    />
                    <text
                        fontSize={18}
                        textAnchor="middle"
                        fontFamily="Josefin"
                        fontWeight={400}
                        fill="#000"
                        transform={`translate(${(personWidth / 2).toString()}, ${(NODE_HEIGHT / 4).toString()})`}
                    >
                        <tspan fontWeight="bold">{getPersonName(person)}</tspan>
                        <tspan x="0" y="25" fontWeight="bold">
                            {person.lastName}
                        </tspan>
                        <tspan x="0" y="50">
                            {birthAndDeath(person.birthDate, person.deathDate)}
                        </tspan>
                    </text>
                </Link>
            </g>
        );
    } else if (node.data.members.length === 2) {
        /**
         * @SPEC 2.0
         * sorting by the sex
         * */
        const [firstPartner, secondPartner] = Array.from(node.data.members.values()).toSorted();
        if (!firstPartner) {
            throw new Error("no person");
        }
        if (!secondPartner) {
            throw new Error("no person");
        }
        const secondPartnerWidth = secondPartner.width * NODE_SIZE_FACTOR + NODE_BASE_WIDTH;
        const firstPartnerWidth = firstPartner.width * NODE_SIZE_FACTOR + NODE_BASE_WIDTH;
        const totalWidth = firstPartnerWidth + secondPartnerWidth;
        return (
            <g transform={`translate(${(node.x - totalWidth / 2).toString()},${node.y.toString()})`}>
                <Link to={`${RouterPath.OSOBY}/${secondPartner.id}`}>
                    <rect
                        fill={secondPartner.color}
                        strokeWidth={1}
                        stroke="#797979"
                        width={secondPartnerWidth}
                        height={NODE_HEIGHT}
                        shapeRendering="optimizeSpeed"
                    />
                    <text
                        fontSize={18}
                        textAnchor="middle"
                        fontFamily={"Josefin"}
                        fontWeight={400}
                        fill="#000"
                        transform={`translate(${(secondPartnerWidth / 2).toString()}, ${(NODE_HEIGHT / 4).toString()})`}
                    >
                        <tspan fontWeight="bold">{getPersonName(secondPartner)}</tspan>
                        <tspan x="0" y="25" fontWeight="bold">
                            {secondPartner.lastName}
                        </tspan>
                        <tspan x="0" y="50">
                            {birthAndDeath(secondPartner.birthDate, secondPartner.deathDate)}
                        </tspan>
                    </text>
                </Link>
                <Link to={`${RouterPath.OSOBY}/${firstPartner.id}`}>
                    <rect
                        fill={firstPartner.color}
                        strokeWidth={1}
                        stroke="#797979"
                        width={firstPartnerWidth}
                        height={NODE_HEIGHT}
                        shapeRendering="optimizeSpeed"
                        transform={`translate(${secondPartnerWidth.toString()}, ${(0).toString()})`}
                    />
                    <text
                        fontSize={18}
                        textAnchor="middle"
                        fontFamily="Josefin"
                        fontWeight={400}
                        fill="#000"
                        transform={`translate(${(secondPartnerWidth + firstPartnerWidth / 2).toString()}, ${(NODE_HEIGHT / 4).toString()})`}
                    >
                        <tspan fontWeight="bold">{getPersonName(firstPartner)}</tspan>
                        <tspan x="0" y="25" fontWeight="bold">
                            {firstPartner.lastName}
                        </tspan>
                        <tspan x="0" y="50">
                            {birthAndDeath(firstPartner.birthDate, firstPartner.deathDate)}
                        </tspan>
                    </text>
                </Link>
            </g>
        );
    } else {
        throw new Error("polygamy not handled");
    }
}

function centerHorizontally(pos: StartingPosition, clientWidth: number) {
    return {
        x: pos.x + clientWidth / 2,
        y: pos.y,
    };
}

function centerVertically(pos: StartingPosition, clientHeight: number) {
    return {
        x: pos.x,
        y: pos.y + clientHeight / 2 - NODE_HEIGHT,
    };
}

/**
 * @description
 * Get the median value for X and Y
 */
function calculateCenterPos(people: HierarchyPointNode<HeritageSVGNode>[]) {
    // The more you go the left the more negative the value
    let left = Infinity;
    let right = -Infinity;
    // The more you go the bottom the higher the value
    let top = Infinity;
    let bottom = -Infinity;

    for (const person of people) {
        if (person.y < top) {
            top = person.y;
        }
        if (person.y > bottom) {
            bottom = person.y;
        }
        if (person.x > right) {
            right = person.x;
        }
        if (person.x < left) {
            left = person.x;
        }
    }

    const meanY = (bottom + top) / 2;
    const meanX = (left + right) / 2;

    return { x: -meanX, y: -meanY } as const;
}

type CalculateInitialPositionOptions = {
    personInCenter: string | undefined;
    clientWidth: number;
    clientHeight: number;
};

/**
 * Use only visible descendants when centering tree so invisible ones do not break centering
 * Initially every root node starts at position { x:0, y:0 }
 * */
function calculateInitialPos(
    heritage: HierarchyPointNode<HeritageSVGNode>[],
    options: CalculateInitialPositionOptions,
) {
    const centeringMode = options.personInCenter == null ? "centre" : "on_person";
    if (centeringMode === "centre") {
        let pos = calculateCenterPos(heritage);
        pos = centerHorizontally(pos, options.clientWidth);
        pos = centerVertically(pos, options.clientHeight);
        return pos;
    }
    if (centeringMode === "on_person") {
        const person = heritage.find((person) =>
            person.data.members.some((member) => member.id === options.personInCenter),
        );
        if (!person) {
            throw new Error("cannot find person in heritage object");
        }
        let pos = { x: -person.x, y: -person.y };
        pos = centerHorizontally(pos, options.clientWidth);
        pos = centerVertically(pos, options.clientHeight);
        return pos;
    }
    throw new Error("unknown focus mode");
}

// ToDo: Try drawing parents with line between them

export function HeritageGraph({ rootPerson, highlightedPerson, inactiveBranches = [] }: FamilyGraphComponent) {
    const { heritage } = useHeritage();
    const svgElement = useRef<ComponentRef<"svg">>(null);

    if (!heritage) {
        throw new Error("Expected heritage data");
    }

    const tree = new Graph(heritage, { excludedPeople: inactiveBranches, rootPerson }).toD3();

    // ToDo: Use LayoutEffect to avoid layout shift and render when it's ready
    useEffect(() => {
        const treeSVG = select(svgElement.current);

        const clientWidth = svgElement.current?.clientWidth;
        if (isNil(clientWidth)) {
            throw new Error("missing client width");
        }

        const clientHeight = svgElement.current?.clientHeight;
        if (isNil(clientHeight)) {
            throw new Error("missing client width");
        }

        const treeZoom = zoom()
            .scaleExtent([0.05, 2])
            .on("zoom", (event: SVGSVGElement) => {
                // @ts-expect-error Internal d3 types conflict
                select("svg g").attr("transform", event.transform);
                // setTransformSVG(event.transform);
                // svgElement.current.children[0].style.transform = event.transform;
            });

        // @ts-expect-error Internal d3 types conflict
        treeSVG.call(treeZoom);

        const visibleDescendants = tree.descendants.filter((descendant) => !descendant.data.empty);
        const startingPos = calculateInitialPos(visibleDescendants, {
            personInCenter: highlightedPerson,
            clientWidth,
            clientHeight,
        });

        function setInitialPositon() {
            return zoomIdentity.translate(startingPos.x, startingPos.y);
        }
        // @ts-expect-error Internal d3 types conflict
        // eslint-disable-next-line
        treeSVG.call(treeZoom.transform, setInitialPositon);

        return () => {
            treeSVG.on("zoom", treeZoom);
        };
    }, [highlightedPerson, rootPerson, tree]);

    return (
        <svg ref={svgElement} width="100%" height="100%" className="cursor-move">
            <g transform={zoomIdentity.toString()}>
                {tree.descendants.map((node) => (
                    <ChildToParentLink key={node.data.id} node={node} />
                ))}
                {tree.extraParents.map((connection) => (
                    <ChildToExtraParentLink key={connectionKey(connection)} from={connection.from} to={connection.to} />
                ))}
                {tree.remarriages.map((connection) => (
                    <RemarriageLink key={connectionKey(connection)} from={connection.from} to={connection.to} />
                ))}
                {tree.descendants.map((node) => (
                    <Node key={node.data.id} node={node} />
                ))}
            </g>
        </svg>
    );
}

export function ErrorFallback() {
    return (
        <div className="h-full grid content-center justify-center text-xl gap-4">
            <OctagonAlertIcon className="mx-auto" size={40} />
            <p>Nieobsłużony błąd uniemożliwił wyświetlenie drzewa</p>
        </div>
    );
}
