import { zoom, zoomIdentity, ZoomTransform, type D3ZoomEvent } from "d3-zoom";
import { select, type Selection } from "d3-selection";
import { type HierarchyPointNode } from "d3-hierarchy";

import { isNil } from "@/lib/utils.ts";
import type { PersonEvent } from "@/types/heritage.types";

import { NODE_BASE_WIDTH, NODE_HEIGHT, NODE_SIZE_FACTOR, VERTICAL_SPACE_BETWEEN_NODES } from "./constants";
import { getCanvasSizeFromParent as getStretchedCanvasSize } from "./utils";
import type { HeritageSVGNode, SVGPersonDetails } from "./graph";
import type { CanvasGraphDataset, StartingPosition } from "./graph.types";

type ClickableArea = {
    x: number;
    y: number;
    width: number;
    height: number;
    personId: string;
};

const TREE_FONT = "PlaypenSans";

/** @description name */
const MAIN_FONT_WEIGHT = "400";
const MAIN_FONT_SIZE = "17";

/** @description dates */
const SIDE_FONT_SIZE = "13";
const SIDE_FONT_WEIGHT = "400";

const STROKE_COLOR = "#797979";
const TEXT_COLOR = "#000";

/** @description extra parent line is above normal one so it's more visible */
const EXTRA_PARENT_OFFSET = 10;
/** @description do not render all details when zoomed out. They are not visible anyway */
// const LOD_THRESHOLD = 0.2;

interface CanvasOptions {
    startingPosition: StartingPosition;
    onClick: (id: string) => void;
}

export class Canvas {
    #canvas: HTMLCanvasElement;
    #canvasSelection: Selection<HTMLCanvasElement, unknown, null, undefined>;
    #canvasContext: CanvasRenderingContext2D;
    #canvasTransform!: ZoomTransform;
    #clickableAreas!: ClickableArea[];

    #graphDataset: CanvasGraphDataset;

    #boundOnResize!: () => void;
    #boundOnClick!: (event: PointerEvent) => void;

    constructor(canvas: HTMLCanvasElement, graphDataset: CanvasGraphDataset, options: CanvasOptions) {
        const { startingPosition } = options;

        this.#canvas = canvas;
        this.#canvasContext = this.#getCanvasContext();
        this.#canvasSelection = select(canvas);

        this.#graphDataset = graphDataset;

        this.#setCanvasSize();

        this.#handleResize();
        this.#handlePanAndZoom(startingPosition);
        this.#handlePersonClick(options.onClick);
    }

    #handlePersonClick(callback: (id: string) => void) {
        this.#boundOnClick = (event: PointerEvent) => {
            const rect = this.#canvas.getBoundingClientRect();
            const transform = this.#canvasTransform;

            const canvasX = event.clientX - rect.left;
            const canvasY = event.clientY - rect.top;

            const x = (canvasX - transform.x) / transform.k;
            const y = (canvasY - transform.y) / transform.k;

            const clickedArea = this.#clickableAreas.find(
                (area) => x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height,
            );

            if (clickedArea) {
                callback(clickedArea.personId);
            }
        };
        this.#canvas.addEventListener("click", this.#boundOnClick);
    }

    #handlePanAndZoom(startingPosition: { x: number; y: number }) {
        const zoomBehavior = zoom<HTMLCanvasElement, unknown>()
            .scaleExtent([0.05, 2])
            .on("zoom", (event: D3ZoomEvent<HTMLCanvasElement, unknown>) => {
                this.#canvasTransform = event.transform;

                this.#render();
            });

        this.#canvasSelection.call(zoomBehavior).call((selection) => {
            zoomBehavior.transform(selection, zoomIdentity.translate(startingPosition.x, startingPosition.y));
        });
    }

    #getCanvasContext() {
        const context = this.#canvas.getContext("2d");
        if (!context) {
            throw new Error("no canvas context");
        }
        return context;
    }

    #handleResize() {
        this.#boundOnResize = () => {
            this.#setCanvasSize();
            this.#render();
        };

        window.addEventListener("resize", this.#boundOnResize);
    }

    #setCanvasSize() {
        // reset canvas size so it does not affect parent element
        this.#canvas.width = 0;
        this.#canvas.height = 0;
        this.#canvas.style.width = "0";
        this.#canvas.style.height = "0";

        const { height, width } = getStretchedCanvasSize(this.#canvas);

        const dpr = window.devicePixelRatio || 1;

        this.#canvas.style.width = `${width.toString()}px`;
        this.#canvas.style.height = `${height.toString()}px`;

        this.#canvas.width = width * dpr;
        this.#canvas.height = height * dpr;
    }

    #render() {
        this.#clickableAreas = [];

        this.#canvasContext.reset();

        const dpr = window.devicePixelRatio || 1;

        this.#canvasContext.scale(dpr, dpr);
        this.#canvasContext.translate(this.#canvasTransform.x, this.#canvasTransform.y);
        this.#canvasContext.scale(this.#canvasTransform.k, this.#canvasTransform.k);

        // if (this.#canvasTransform.k > LOD_THRESHOLD) {
        for (const node of this.#graphDataset.descendants) {
            if (node.parent && !node.parent.data.empty && !node.data.treatedAsRemarriage) {
                this.#drawParentToChildLine(node, node.parent);
            }
        }

        for (const connection of this.#graphDataset.extraParents) {
            this.#drawExtraParentToChildLine(connection.from, connection.to);
        }

        for (const connection of this.#graphDataset.remarriages) {
            this.#drawRemarriageLine(connection.from, connection.to);
        }
        // }

        for (const node of this.#graphDataset.descendants) {
            this.#drawNode(node);
        }
    }

    #drawExtraParentToChildLine(
        child: HierarchyPointNode<HeritageSVGNode>,
        parent: HierarchyPointNode<HeritageSVGNode>,
    ) {
        const personAnchor = getPersonAnchor(child, parent);
        const parentAnchor = getParentAnchor(parent);

        this.#canvasContext.beginPath();
        this.#canvasContext.moveTo(parent.x + parentAnchor.x, parent.y);
        this.#canvasContext.lineTo(
            parent.x + parentAnchor.x,
            child.y - VERTICAL_SPACE_BETWEEN_NODES / 2 + EXTRA_PARENT_OFFSET,
        );
        this.#canvasContext.lineTo(
            child.x + personAnchor.x,
            child.y - VERTICAL_SPACE_BETWEEN_NODES / 2 + EXTRA_PARENT_OFFSET,
        );
        this.#canvasContext.lineTo(child.x + personAnchor.x, child.y);
        this.#canvasContext.strokeStyle = STROKE_COLOR;
        this.#canvasContext.lineWidth = 1;
        this.#canvasContext.setLineDash([4, 4]);
        this.#canvasContext.stroke();
        this.#canvasContext.setLineDash([]);
    }

    /** @description Draw line from center of the parent to the center of the child. Even if child is in family. */
    #drawParentToChildLine(child: HierarchyPointNode<HeritageSVGNode>, parent: HierarchyPointNode<HeritageSVGNode>) {
        const personAnchor = getPersonAnchor(child, parent);
        const parentAnchor = getParentAnchor(parent);

        this.#canvasContext.beginPath();
        this.#canvasContext.moveTo(parent.x + parentAnchor.x, parent.y);
        this.#canvasContext.lineTo(parent.x + parentAnchor.x, child.y - VERTICAL_SPACE_BETWEEN_NODES / 2);
        this.#canvasContext.lineTo(child.x + personAnchor.x, child.y - VERTICAL_SPACE_BETWEEN_NODES / 2);
        this.#canvasContext.lineTo(child.x + personAnchor.x, child.y);
        this.#canvasContext.strokeStyle = STROKE_COLOR;
        this.#canvasContext.lineWidth = 1;
        this.#canvasContext.stroke();
    }

    #drawRemarriageLine(from: HierarchyPointNode<HeritageSVGNode>, to: HierarchyPointNode<HeritageSVGNode>) {
        this.#canvasContext.beginPath();
        this.#canvasContext.moveTo(from.x, from.y + NODE_HEIGHT / 2);
        this.#canvasContext.lineTo(to.x, to.y + NODE_HEIGHT / 2);
        this.#canvasContext.strokeStyle = STROKE_COLOR;
        this.#canvasContext.lineWidth = 1;
        this.#canvasContext.setLineDash([4, 4]);
        this.#canvasContext.stroke();
        this.#canvasContext.setLineDash([]);
    }

    #drawNode(node: HierarchyPointNode<HeritageSVGNode>) {
        if (node.data.empty) {
            return;
        }
        if (node.data.members.length === 1) {
            const [person] = Array.from(node.data.members.values());
            if (!person) {
                throw new Error("no person");
            }

            const personWidth = person.width * NODE_SIZE_FACTOR + NODE_BASE_WIDTH;
            const centerNode = node.x - personWidth / 2;

            drawRectangle(this.#canvasContext, {
                color: person.color,
                x: centerNode,
                y: node.y,
                width: personWidth,
            });

            // if (this.#canvasTransform.k > LOD_THRESHOLD) {
            this.#clickableAreas.push({
                x: centerNode,
                y: node.y,
                width: personWidth,
                height: NODE_HEIGHT,
                personId: person.id,
            });

            drawText(this.#canvasContext, {
                person,
                x: centerNode + personWidth / 2,
                y: node.y,
            });
            // }
        } else if (node.data.members.length === 2) {
            const sorted = Array.from(node.data.members.values()).toSorted();
            const firstPartner = sorted[0];
            const secondPartner = sorted[1];
            if (!firstPartner || !secondPartner) {
                throw new Error("no person");
            }

            const secondPartnerWidth = secondPartner.width * NODE_SIZE_FACTOR + NODE_BASE_WIDTH;
            const firstPartnerWidth = firstPartner.width * NODE_SIZE_FACTOR + NODE_BASE_WIDTH;
            const totalWidth = firstPartnerWidth + secondPartnerWidth;
            const startX = node.x - totalWidth / 2;

            drawRectangle(this.#canvasContext, {
                color: secondPartner.color,
                x: startX,
                y: node.y,
                width: secondPartnerWidth,
            });

            // if (this.#canvasTransform.k > LOD_THRESHOLD) {
            this.#clickableAreas.push({
                x: startX,
                y: node.y,
                width: secondPartnerWidth,
                height: NODE_HEIGHT,
                personId: secondPartner.id,
            });

            drawText(this.#canvasContext, {
                person: secondPartner,
                x: startX + secondPartnerWidth / 2,
                y: node.y,
            });
            // }

            drawRectangle(this.#canvasContext, {
                color: firstPartner.color,
                x: startX + secondPartnerWidth,
                y: node.y,
                width: firstPartnerWidth,
            });

            // if (this.#canvasTransform.k > LOD_THRESHOLD) {
            this.#clickableAreas.push({
                x: startX + secondPartnerWidth,
                y: node.y,
                width: firstPartnerWidth,
                height: NODE_HEIGHT,
                personId: firstPartner.id,
            });

            drawText(this.#canvasContext, {
                person: firstPartner,
                x: startX + secondPartnerWidth + firstPartnerWidth / 2,
                y: node.y,
            });
            // }
        } else {
            throw new Error("polygamy not handled");
        }
    }

    cleanUp() {
        window.removeEventListener("resize", this.#boundOnResize);
        this.#canvas.removeEventListener("click", this.#boundOnClick);
        this.#canvasSelection.on("zoom", null);
    }
}

interface RectangleOptions {
    color: string;
    x: number;
    y: number;
    width: number;
}
function drawRectangle(context: CanvasRenderingContext2D, options: RectangleOptions) {
    context.fillStyle = options.color;
    context.strokeStyle = STROKE_COLOR;
    context.lineWidth = 1;
    context.fillRect(options.x, options.y, options.width, NODE_HEIGHT);
    context.strokeRect(options.x, options.y, options.width, NODE_HEIGHT);
}

interface TextOptions {
    person: SVGPersonDetails;
    x: number;
    y: number;
}
function drawText(context: CanvasRenderingContext2D, options: TextOptions) {
    context.fillStyle = TEXT_COLOR;
    context.font = `${MAIN_FONT_WEIGHT} ${MAIN_FONT_SIZE}px ${TREE_FONT}`;
    context.textAlign = "center";

    const textY = options.y + NODE_HEIGHT / 4;

    context.fillText(getPersonName(options.person), options.x, textY);
    context.fillText(options.person.lastName, options.x, textY + 25);

    context.font = `${SIDE_FONT_WEIGHT} ${SIDE_FONT_SIZE}px ${TREE_FONT}`;
    context.fillText(birthAndDeath(options.person.birthDate, options.person.deathDate), options.x, textY + 50);
}

function getParentAnchor(parent: HierarchyPointNode<HeritageSVGNode>) {
    if (parent.data.members.length === 1) {
        return { x: 0, y: 0 };
    } else if (parent.data.members.length === 2) {
        const sorted = Array.from(parent.data.members.values()).toSorted();
        const personOnLeft = sorted[1];
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
        const sorted = Array.from(person.data.members.values()).toSorted();
        const secondPartner = sorted[0];
        const firstPartner = sorted[1];
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
