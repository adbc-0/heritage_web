import { useEffect } from "react";
import * as topola from "topola";

import { useHeritage } from "@/contexts/heritageContext";
import { useNavigate } from "react-router";
import { RoutePaths } from "@/constants/RoutePaths";

export default function Home() {
    const heritageDataset = useHeritage();
    const navigate = useNavigate();
    useEffect(() => {
        if (!heritageDataset) {
            return;
        }
        topola
            .createChart({
                json: heritageDataset,
                svgSelector: "#relative",
                chartType: topola.HourglassChart,
                renderer: topola.SimpleRenderer,
                indiCallback(data) {
                    void navigate(`${RoutePaths.OSOBY}/${data.id}`);
                },
            })
            .render();
    }, [heritageDataset, navigate]);
    return (
        <div className="bg-background m-3 border border-border">
            <svg id="relative" />
        </div>
    );
}
