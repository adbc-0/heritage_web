import {
    ComponentRef,
    SVGTextElementAttributes,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Link } from "react-router";
import { select } from "d3-selection";
import { HierarchyPointNode } from "d3-hierarchy";
import { zoom, zoomIdentity } from "d3-zoom";
import { ChevronLeft, Settings } from "lucide-react";

import { createFamilyTree, D3Node, PersonNode } from "@/heritage";
import { isNil } from "@/lib/utils";
import { RouterPath } from "@/constants/routePaths.ts";
import { SVGSettings } from "./SVGSettings";
import v2 from "../../v2.json";

const defaultBranches = [
    {
        active: true,
        name: "Ippoldtowie",
        rootIndiId: "I38",
    },
    {
        active: true,
        name: "Pizłowie",
        rootIndiId: "I5",
    },
    {
        active: true,
        name: "Bieleccy",
        rootIndiId: "I154",
    },
    {
        active: true,
        name: "Niziołowie",
        rootIndiId: "I156",
    },
    {
        active: true,
        name: "Nowakowie",
        rootIndiId: "I303",
    },
    {
        active: true,
        name: "Pinkoszowie",
        rootIndiId: "I296",
    },
    {
        active: true,
        name: "Ozimkowie",
        rootIndiId: "I212",
    },
];

// function drawStraightLink(d: HierarchyPointLink<D3Node>) {
//     return `M${d.source.x.toString()},${d.source.y.toString()}H${d.target.x.toString()}V${d.target.y.toString()}`;
// }

// function NodeLink({ link }: { link: HierarchyPointLink<D3Node> }) {
//     return <path d={drawStraightLink(link)} fill="none" stroke="#000" strokeWidth="1px" />;
// }

function getParentAnchor(node: HierarchyPointNode<D3Node>) {
    if (!node.data.spouse) {
        return { x: 50, y: 0 };
    }
    return { x: 100, y: 0 };
}

function getPersonAnchor(person: HierarchyPointNode<D3Node>) {
    if (person.data.person.type === "EMPTY_NODE") {
        throw new Error("Wrong person type");
    }
    if (!person.data.spouse) {
        return { x: 50, y: 0 };
    }
    if (person.data.spouse.type === "EMPTY_NODE") {
        throw new Error("Wrong person type");
    }
    const personNode = person.data.person;
    const spouseNode = person.data.spouse;
    const [personOnTheLeft] = sortPerson(personNode, spouseNode);
    if (personOnTheLeft.id === personNode.id) {
        return { x: 50, y: 0 };
    }
    return { x: 150, y: 0 };
}

function drawLine(person: HierarchyPointNode<D3Node>, parent: HierarchyPointNode<D3Node>) {
    const parentAnchor = getParentAnchor(parent);
    const personAnchor = getPersonAnchor(person);
    const VERTICAL_SPACE_BETWEEN_NODE = 40;
    return (
        "M " +
        (parent.x + parentAnchor.x).toString() +
        " " +
        parent.y.toString() +
        " L " +
        (parent.x + parentAnchor.x).toString() +
        " " +
        (person.y - VERTICAL_SPACE_BETWEEN_NODE).toString() +
        " " +
        (person.x + personAnchor.x).toString() +
        " " +
        (person.y - VERTICAL_SPACE_BETWEEN_NODE).toString() +
        " " +
        (person.x + personAnchor.x).toString() +
        " " +
        person.y.toString()
    );
}

function NodeLink({ node }: { node: HierarchyPointNode<D3Node> }) {
    // don't draw link to a parent if the parent does not exist
    if (!node.parent) {
        return null;
    }
    // don't draw link to a parent if the parent does not exist
    if (node.parent.data.person.type === "EMPTY_NODE") {
        return null;
    }
    // const parentAnchor = getParentAnchor(node.parent);
    // if (!node.data.spouse) {
    //     return (
    //         <path
    //             d={`M ${node.parent.x + parentAnchor.x} ${node.parent.y} L ${node.parent.x + parentAnchor.x} ${node.y - 40} ${node.x + 50} ${node.y - 40} ${node.x + 50} ${node.y}`}
    //             fill="none"
    //             stroke="#000"
    //             strokeWidth="1px"
    //         />
    //     );
    // }
    return <path d={drawLine(node, node.parent)} fill="none" stroke="#000" strokeWidth="1px" />;
    // const personAnchor = getNodeAnchor(node.data.person, node.data.spouse);
    // return (
    //     <path
    //         d={`M ${node.parent.x + parentAnchor.x} ${node.parent.y} L ${node.parent.x + parentAnchor.x} ${node.y - 40} ${node.x + personAnchor.x} ${node.y - 40} ${node.x + personAnchor.x} ${node.y}`}
    //         fill="none"
    //         stroke="#000"
    //         strokeWidth="1px"
    //     />
    // );
}

function sortPerson(person: PersonNode, spouse: PersonNode) {
    if (person.sex === "F") {
        return [person, spouse] as const;
    }
    return [spouse, person] as const;
}

function NodePersonDate({ person, ...textProps }: { person: PersonNode }) {
    if (isNil(person.birth) && isNil(person.death)) {
        return null;
    }
    return <text {...textProps}>{printDateOnNode(person)}</text>;
}

type NodePersonNameT = SVGTextElementAttributes<SVGTextElement> & {
    name: string;
};
function NodePersonName({ name, ...props }: NodePersonNameT) {
    if (!name) {
        return null;
    }
    return <text {...props}>{name}</text>;
}

function printDateOnNode(person: PersonNode) {
    return (person.birth?.date.year ?? "") + " - " + (person.death?.date.year ?? "");
}

function Node({ node }: { node: HierarchyPointNode<D3Node> }) {
    const { type: personType } = node.data.person;
    if (personType === "EMPTY_NODE") {
        return null;
    }
    if (personType === "PERSON_NODE") {
        if (isNil(node.data.spouse)) {
            return (
                <g transform={`translate(${node.x},${node.y})`}>
                    <Link to={`${RouterPath.OSOBY}/${node.data.person.id}`}>
                        <rect
                            width={100}
                            height={75}
                            stroke="#000"
                            fill={node.data.person.color || "#000"}
                        />
                        <NodePersonName
                            name={node.data.person.firstName}
                            textAnchor="middle"
                            transform="translate(50, 25)"
                        />
                        <text textAnchor="middle" transform="translate(50, 45)">
                            {node.data.person.nickName} {node.data.person.lastName}
                        </text>
                        <NodePersonDate
                            person={node.data.person}
                            textAnchor="middle"
                            transform="translate(50, 65)"
                        />
                    </Link>
                </g>
            );
        } else {
            if (node.data.spouse.type === "EMPTY_NODE") {
                throw new Error("Unexpected node type");
            }
            const [personOnTheLeft, personOnTheRight] = sortPerson(
                node.data.person,
                node.data.spouse,
            );
            return (
                <g transform={`translate(${node.x},${node.y})`}>
                    <Link to={`${RouterPath.OSOBY}/${personOnTheLeft.id}`}>
                        <rect
                            width={100}
                            height={75}
                            stroke="#000"
                            fill={personOnTheLeft.color || "#000"}
                        />
                        <NodePersonName
                            name={personOnTheLeft.firstName}
                            textAnchor="middle"
                            transform="translate(50, 25)"
                        />
                        <text textAnchor="middle" transform="translate(50, 45)">
                            {personOnTheLeft.nickName} {personOnTheLeft.lastName}
                        </text>
                        <NodePersonDate
                            person={node.data.person}
                            textAnchor="middle"
                            transform="translate(50, 65)"
                        />
                    </Link>
                    <Link to={`${RouterPath.OSOBY}/${personOnTheRight.id}`}>
                        <rect
                            transform="translate(100)"
                            width={100}
                            height={75}
                            stroke="#000"
                            fill={personOnTheRight.color || "#000"}
                            onClick={() => {
                                console.log("cb");
                            }}
                        />
                        <NodePersonName
                            name={personOnTheRight.firstName}
                            textAnchor="middle"
                            transform="translate(150, 25)"
                        />
                        <text textAnchor="middle" transform="translate(150, 45)">
                            {personOnTheRight.nickName} {personOnTheRight.lastName}
                        </text>
                        <NodePersonDate
                            person={node.data.person}
                            textAnchor="middle"
                            transform="translate(150, 65)"
                        />
                    </Link>
                </g>
            );
        }
    }
    throw new Error("Unknown person type");
}

// function keyFromLink(link: HierarchyPointLink<D3Node>) {
//     return `from-${link.source.data.id}to-${link.target.data.id}`;
// }

// women on left

export default function Home() {
    const svgElement = useRef<ComponentRef<"svg">>(null);
    const [branches, setBranches] = useState(defaultBranches);
    const [settingsAreOpen, setSettingsAreOpen] = useState(false);
    // ToDo: experiment with Ref to avoid rerenders
    const [transformSVG, setTransformSVG] = useState(zoomIdentity);

    const renderedBranches = useMemo(() => {
        return branches.filter((branch) => branch.active).map((branch) => branch.name);
    }, [branches]);

    useEffect(() => {
        const treeSVG = select(svgElement.current);
        const treeZoom = zoom()
            .scaleExtent([0.09, 2])
            .on("zoom", (event) => {
                select("svg g").attr("transform", event.transform);
                // setTransformSVG(event.transform);
                // svgElement.current.children[0].style.transform = event.transform;
            });
        treeSVG.call(treeZoom);

        return () => {
            // ToDo: Remove event listener
            treeSVG.on("zoom", null);
        };
    }, []);

    // Dev use effect
    useEffect(() => {
        function countAllChildren(element) {
            let count = 0;
            for (const child of element.children) {
                count++;
                count += countAllChildren(child);
            }
            return count;
        }
        console.log("SVG Elements:", countAllChildren(svgElement.current));
    }, []);

    function openSVGSettingsView() {
        setSettingsAreOpen(true);
    }

    function closeSVGSettingsView() {
        setSettingsAreOpen(false);
    }

    const toggleBranch = useCallback(
        (branchName: string) => {
            const copy = structuredClone(branches);
            const branch = copy.find(({ name }) => name === branchName);
            if (!branch) {
                throw new Error("Branch was not found");
            }
            const userIsAttemptingToRemoveLastActiveBranch =
                branch.active && renderedBranches.length === 1;
            if (userIsAttemptingToRemoveLastActiveBranch) {
                return;
            }
            branch.active = !branch.active;
            setBranches(copy);
        },
        [branches, renderedBranches.length],
    );

    const tree = useMemo(() => {
        return createFamilyTree({ json: v2 });
    }, []);

    console.log("rerender");
    // console.log("tree", tree);
    // console.log("desc", tree.descendants());

    return (
        <div className="h-full">
            <div className="bg-background h-full flex flex-col">
                {/* ToolBar */}
                {settingsAreOpen && (
                    <div className="flex border-b border-border p-2 justify-end">
                        <button
                            type="button"
                            className="cursor-pointer p-1 rounded-md"
                            onClick={closeSVGSettingsView}
                        >
                            <ChevronLeft size={22} />
                        </button>
                    </div>
                )}
                {!settingsAreOpen && (
                    <div className="flex border-b border-border p-2 justify-end">
                        <button
                            type="button"
                            className="cursor-pointer p-1 rounded-md"
                            onClick={openSVGSettingsView}
                        >
                            <Settings size={22} />
                        </button>
                    </div>
                )}
                {settingsAreOpen && <SVGSettings branches={branches} toggleBranch={toggleBranch} />}
                <svg ref={svgElement} width="100%" height="100%" className="cursor-move">
                    <g transform={transformSVG}>
                        {/*{tree.links().map((link) => (*/}
                        {/*    <NodeLink key={keyFromLink(link)} link={link} />*/}
                        {/*))}*/}
                        {tree.descendants().map((node) => (
                            <NodeLink key={node.data.id} node={node} />
                        ))}
                        {tree.descendants().map((node) => (
                            <Node key={node.data.id} node={node} />
                        ))}
                    </g>
                </svg>
            </div>
        </div>
    );
}

// useEffect(() => {
//     if (!heritage) {
//         return;
//     }
//     if (settingsAreOpen) {
//         return;
//     }
//     const svgRef = svgElement.current;
//     const inactiveBranches = branches
//         .filter((branch) => !branch.active)
//         .map((branch) => branch.rootIndiId);
//     const heritageDatasetWithFilteredBranches = transformHeritageDatasetForActiveBranches(
//         heritage,
//         inactiveBranches,
//     );
//     topola
//         .createChart({
//             json: heritageDatasetWithFilteredBranches,
//             svgSelector: "#relative",
//             chartType: topola.HourglassChart,
//             renderer: topola.SimpleRenderer,
//             indiCallback(data) {
//                 void navigate(`${RouterPath.OSOBY}/${data.id}`);
//             },
//         })
//         .render();
//     return () => {
//         if (!svgRef) {
//             throw new Error("cannot cleanup svg element");
//         }
//         svgRef.replaceChildren();
//     };
// }, [heritage, settingsAreOpen, branches, navigate]);
