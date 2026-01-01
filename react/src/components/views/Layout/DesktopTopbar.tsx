import { preload } from "react-dom";
import { NavLink } from "react-router";

import LOGO from "@/assets/logo.svg";

import { RouterPath } from "@/constants/routePaths";

import styles from "./styles.module.css";

export function DesktopTopbar() {
    preload(LOGO, { as: "image", type: "image/svg+xml" });
    return (
        <nav className={styles.navigation_sidebar}>
            {/*<NavLink to={RouterPath.ROOT} className="flex items-center gap-2 text-xl font-semibold">*/}
            {/*    <img src={LOGO} width={170} height={32} className="cursor-pointer" alt="logo" />*/}
            {/*</NavLink>*/}
            <NavLink to={RouterPath.ROOT}>Drzewo</NavLink>
            <NavLink to={RouterPath.OSOBY}>Osoby</NavLink>
        </nav>
    );
}
