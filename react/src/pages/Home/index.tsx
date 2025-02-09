import { useEffect } from "react";
import { useNavigate } from "react-router";
import * as topola from "topola";

import { useHeritage } from "@/contexts/heritageContext";
import { RouterPath } from "@/constants/routePaths";

export default function Home() {
    const { heritage } = useHeritage();
    const navigate = useNavigate();

    useEffect(() => {
        if (!heritage) {
            return;
        }
        topola
            .createChart({
                json: heritage,
                svgSelector: "#relative",
                chartType: topola.HourglassChart,
                renderer: topola.SimpleRenderer,
                indiCallback(data) {
                    void navigate(`${RouterPath.OSOBY}/${data.id}`);
                },
            })
            .render();
    }, [heritage, navigate]);

    return (
        <div className="h-full py-2">
            <div className="bg-background border border-border h-full">
                <svg id="relative" className="cursor-move" />
            </div>
        </div>
    );
}
