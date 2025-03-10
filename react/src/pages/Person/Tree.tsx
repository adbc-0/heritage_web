import { ComponentRef, useEffect, useRef } from "react";
import { Params, useNavigate, useParams } from "react-router";
import * as topola from "topola";

import { RouterPath } from "@/constants/routePaths";
import { useHeritage } from "@/contexts/heritageContext";
import { transformDatasetForPerson } from "@/utils/heritage";

// ToDo: what will happen with ozimki root. Will dummy node be rendered?
export function Tree() {
    const { id } = useParams<Params>();
    const { heritage } = useHeritage();
    const navigate = useNavigate();
    const svgElement = useRef<ComponentRef<"svg">>(null);
    useEffect(() => {
        if (!id) {
            return;
        }
        if (!heritage) {
            return;
        }
        const svgRef = svgElement.current;
        topola
            .createChart({
                json: transformDatasetForPerson(heritage, id),
                svgSelector: "#relative",
                chartType: topola.HourglassChart,
                renderer: topola.SimpleRenderer,
                indiCallback(data) {
                    void navigate(`${RouterPath.OSOBY}/${data.id}`);
                },
            })
            .render();
        return () => {
            if (!svgRef) {
                throw new Error("cannot cleanup svg element");
            }
            svgRef.replaceChildren();
        };
    }, [heritage, id, navigate]);
    return (
        <div className="bg-background border-t border-border h-full">
            <svg
                ref={svgElement}
                id="relative"
                className="rounded-md cursor-move"
                height="100%"
                width="100%"
            />
        </div>
    );
}
