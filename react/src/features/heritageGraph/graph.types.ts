import { HierarchyPointNode } from "d3-hierarchy";

import { HeritageSVGNode } from "./graph";

export interface CanvasGraphDataset {
    descendants: HierarchyPointNode<HeritageSVGNode>[];
    extraParents: {
        from: HierarchyPointNode<HeritageSVGNode>;
        to: HierarchyPointNode<HeritageSVGNode>;
    }[];
    remarriages: {
        from: HierarchyPointNode<HeritageSVGNode>;
        to: HierarchyPointNode<HeritageSVGNode>;
    }[];
}

export type StartingPosition = {
    x: number;
    y: number;
};

export type ClickableArea = {
    x: number;
    y: number;
    width: number;
    height: number;
    personId: string;
};
