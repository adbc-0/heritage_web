import { type ComponentRef, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { type HierarchyPointNode } from "d3-hierarchy";

import { RouterPath } from "@/constants/routePaths";
import { useHeritage } from "@/features/heritageData/heritageContext";

import { NODE_HEIGHT } from "./constants";
import { getCanvasSizeFromParent } from "./utils";
import { Canvas } from "./canvas";
import { Graph, type HeritageSVGNode, type SVGPersonDetails } from "./graph";

import styles from "./styles.module.css";

import type { CanvasGraphDataset, StartingPosition } from "./graph.types";

type FamilyGraphComponent = {
    rootPerson?: string;
    inactiveBranches?: string[];
    highlightedPerson?: string;
};

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

interface CanvasSize {
    width: number;
    height: number;
}

const CenteringMode = {
    CENTRE: "CENTRE",
    ON_PERSON: "ON_PERSON",
};

function getCenteringMode(highlightedPerson: string | undefined) {
    if (highlightedPerson == null) {
        return CenteringMode.CENTRE;
    }
    return CenteringMode.ON_PERSON;
}

function getStartingPosition(canvasSize: CanvasSize, graph: CanvasGraphDataset, highlightedPerson: string | undefined) {
    const visibleDescendants = graph.descendants.filter((descendant) => !descendant.data.empty);

    const centeringMode = getCenteringMode(highlightedPerson);

    if (centeringMode === CenteringMode.CENTRE) {
        let position = calculateCenterPos(visibleDescendants);
        position = centerHorizontally(position, canvasSize.width);
        position = centerVertically(position, canvasSize.height);
        return position;
    }
    if (centeringMode === CenteringMode.ON_PERSON) {
        const person = visibleDescendants.find((person) =>
            person.data.members.some((member: SVGPersonDetails) => member.id === highlightedPerson),
        );
        if (!person) {
            throw new Error("cannot find person in heritage object");
        }

        let position = { x: -person.x, y: -person.y };
        position = centerHorizontally(position, canvasSize.width);
        position = centerVertically(position, canvasSize.height);
        return position;
    }

    throw new Error("unknown focus mode");
}

export function HeritageGraph({ rootPerson, highlightedPerson, inactiveBranches = [] }: FamilyGraphComponent) {
    const navigate = useNavigate();
    const { heritage } = useHeritage();

    const canvasRef = useRef<ComponentRef<"canvas">>(null);

    if (!heritage) {
        throw new Error("Expected heritage data");
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            throw new Error("no canvas element");
        }

        const canvasSize = getCanvasSizeFromParent(canvas);

        const graph = new Graph(heritage, { excludedPeople: inactiveBranches, rootPerson });
        const graphDataset = graph.toCanvas();

        const startingPosition = getStartingPosition(canvasSize, graphDataset, highlightedPerson);

        const graphCanvas = new Canvas(canvas, graphDataset, {
            startingPosition,
            onClick: (id) => {
                void navigate(`${RouterPath.OSOBY}/${id}`);
            },
        });

        return () => {
            graphCanvas.cleanUp();
        };
    }, [highlightedPerson, rootPerson, heritage, inactiveBranches, navigate]);

    return <canvas ref={canvasRef} className={styles.canvas} />;
}

export function ErrorFallback() {
    return (
        <div className="h-full grid content-center justify-center text-xl gap-4 px-4">
            <span className="material-symbols-outlined mx-auto" style={{ fontSize: 40 }}>
                warning_amber
            </span>
            <p>Nieobsłużony błąd uniemożliwił wyświetlenie drzewa</p>
        </div>
    );
}
