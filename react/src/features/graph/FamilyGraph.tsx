import { type ComponentRef, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router";
import { zoom, zoomIdentity } from "d3-zoom";
import { select } from "d3-selection";
import { type HierarchyPointNode } from "d3-hierarchy";

import { RouterPath } from "@/constants/routePaths.ts";
import { isNil } from "@/lib/utils.ts";
import { useHeritage } from "@/contexts/heritageContext";

import { NODE_HEIGHT, NODE_WIDTH, VERTICAL_SPACE_BETWEEN_NODES } from "./constants";
import { Graph, type SvgNodeDetails } from "./graph";

import type { PersonEvent } from "@/types/heritage.types";

type FamilyGraphComponent = {
    rootPerson?: string;
    inactiveBranches?: string[];
};

type StartingPosition = {
    x: number;
    y: number;
};

function getParentAnchor() {
    return { x: NODE_WIDTH / 2, y: 0 };
}

function getPersonAnchor(
    person: HierarchyPointNode<SvgNodeDetails>,
    parent: HierarchyPointNode<SvgNodeDetails>,
) {
    if (person.data.members.length === 1) {
        return { x: NODE_WIDTH / 2, y: 0 };
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
            return { x: NODE_WIDTH * 0.25, y: 0 };
        }
        if (secondPartner.parent?.id === parent.id) {
            return { x: NODE_WIDTH * 0.75, y: 0 };
        }
        throw new Error("parent id does not match child id");
    } else {
        throw new Error("polygamy not handled");
    }
}

function drawExtraParentLine(
    child: HierarchyPointNode<SvgNodeDetails>,
    parent: HierarchyPointNode<SvgNodeDetails>,
) {
    const personAnchor = getPersonAnchor(child, parent);
    const parentAnchor = getParentAnchor();
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

function drawLine(
    child: HierarchyPointNode<SvgNodeDetails>,
    parent: HierarchyPointNode<SvgNodeDetails>,
) {
    const personAnchor = getPersonAnchor(child, parent);
    const parentAnchor = getParentAnchor();
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
    from: HierarchyPointNode<SvgNodeDetails>;
    to: HierarchyPointNode<SvgNodeDetails>;
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
    from: HierarchyPointNode<SvgNodeDetails>;
    to: HierarchyPointNode<SvgNodeDetails>;
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

function drawRemarriageLine(
    from: HierarchyPointNode<SvgNodeDetails>,
    to: HierarchyPointNode<SvgNodeDetails>,
) {
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
    from: HierarchyPointNode<SvgNodeDetails>;
    to: HierarchyPointNode<SvgNodeDetails>;
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

function ChildToParentLink({ node }: { node: HierarchyPointNode<SvgNodeDetails> }) {
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

function PersonOrFamily({ node }: { node: HierarchyPointNode<SvgNodeDetails> }) {
    if (node.data.empty) {
        return null;
    }
    if (node.data.members.length === 1) {
        const [person] = Array.from(node.data.members.values());
        if (!person) {
            throw new Error("no person");
        }
        return (
            <g transform={`translate(${(node.x + 70).toString()},${node.y.toString()})`}>
                <Link to={`${RouterPath.OSOBY}/${person.id}`}>
                    <rect
                        fill={person.color}
                        strokeWidth={1}
                        stroke="#797979"
                        width={NODE_WIDTH / 2}
                        height={NODE_HEIGHT}
                    />
                    <text
                        fontSize={18}
                        textAnchor="middle"
                        fontFamily="Josefin"
                        fontWeight={400}
                        fill="#000"
                        transform={`translate(${(NODE_WIDTH / 4).toString()}, ${(NODE_HEIGHT / 4).toString()})`}
                    >
                        <tspan fontWeight="bold">{person.firstName}</tspan>
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
        return (
            <g transform={`translate(${node.x.toString()},${node.y.toString()})`}>
                <Link to={`${RouterPath.OSOBY}/${secondPartner.id}`}>
                    <rect
                        fill={secondPartner.color}
                        strokeWidth={1}
                        stroke="#797979"
                        width={NODE_WIDTH / 2}
                        height={NODE_HEIGHT}
                        shapeRendering="optimizeSpeed"
                    />
                    <text
                        fontSize={18}
                        textAnchor="middle"
                        fontFamily={"Josefin"}
                        fontWeight={400}
                        fill="#000"
                        transform={`translate(${(NODE_WIDTH / 4).toString()}, ${(NODE_HEIGHT / 4).toString()})`}
                    >
                        <tspan fontWeight="bold">{secondPartner.firstName}</tspan>
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
                        width={NODE_WIDTH / 2}
                        height={NODE_HEIGHT}
                        shapeRendering="optimizeSpeed"
                        transform={`translate(${(NODE_WIDTH / 2).toString()}, ${(0).toString()})`}
                    />
                    <text
                        fontSize={18}
                        textAnchor="middle"
                        fontFamily="Josefin"
                        fontWeight={400}
                        fill="#000"
                        transform={`translate(${(NODE_WIDTH * (3 / 4)).toString()}, ${(NODE_HEIGHT / 4).toString()})`}
                    >
                        <tspan fontWeight="bold">{firstPartner.firstName}</tspan>
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
        x: pos.x + clientWidth / 2 - NODE_WIDTH / 2,
        y: pos.y,
    };
}

function centerVertically(pos: StartingPosition, clientHeight: number) {
    return {
        x: pos.x,
        y: pos.y + clientHeight / 2 - NODE_HEIGHT / 2,
    };
}

/**
 * @description
 * Get the median value for X and Y
 */
function calculateCenterPos(people: HierarchyPointNode<SvgNodeDetails>[]) {
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
    root: string | undefined;
    clientWidth: number;
    clientHeight: number;
};
function calculateInitialPos(
    heritage: HierarchyPointNode<SvgNodeDetails>[],
    options: CalculateInitialPositionOptions,
) {
    const focusMode = isNil(options.root) ? "centre" : "on_person";
    if (focusMode === "centre") {
        let pos = calculateCenterPos(heritage);
        pos = centerHorizontally(pos, options.clientWidth);
        pos = centerVertically(pos, options.clientHeight);
        return pos;
    } else if (focusMode === "on_person") {
        let pos = { x: 0, y: 0 };
        pos = centerHorizontally(pos, options.clientWidth);
        pos = centerVertically(pos, options.clientHeight);
        return pos;
    } else {
        throw new Error("unknown focus mode");
    }
}

// ToDo: Try drawing parents with line between them

export function FamilyGraph({ rootPerson, inactiveBranches = [] }: FamilyGraphComponent) {
    const { heritage } = useHeritage();
    const svgElement = useRef<ComponentRef<"svg">>(null);

    const tree = useMemo(() => {
        if (!heritage) {
            throw new Error("Expected heritage data");
        }
        const graph = new Graph(heritage, { excludedPeople: inactiveBranches, rootPerson });
        return graph.toD3();
    }, [heritage, inactiveBranches, rootPerson]);

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
            root: rootPerson,
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
    }, [rootPerson, tree]);

    return (
        <svg ref={svgElement} width="100%" height="100%" className="cursor-move">
            <g transform={zoomIdentity.toString()}>
                {tree.descendants.map((node) => (
                    <ChildToParentLink key={node.data.id} node={node} />
                ))}
                {tree.extraParents.map((connection) => (
                    <ChildToExtraParentLink
                        key={connectionKey(connection)}
                        from={connection.from}
                        to={connection.to}
                    />
                ))}
                {tree.remarriages.map((connection) => (
                    <RemarriageLink
                        key={connectionKey(connection)}
                        from={connection.from}
                        to={connection.to}
                    />
                ))}
                {tree.descendants.map((node) => (
                    <PersonOrFamily key={node.data.id} node={node} />
                ))}
            </g>
        </svg>
    );
}
