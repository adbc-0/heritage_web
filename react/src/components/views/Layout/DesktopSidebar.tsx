import { preload } from "react-dom";
import { NavLink } from "react-router";
import clsx from "clsx";

import { RouterPath } from "@/constants/routePaths";

import LOGO from "@/assets/logo.svg";
import styles from "./styles.module.css";

export function DesktopSidebar() {
    preload(LOGO, { as: "image", type: "image/svg+xml" });
    return (
        <nav className={styles.desktop_sidebar}>
            <NavLink
                to={RouterPath.ROOT}
                className={({ isActive }) => clsx(styles.link, { [styles.active_link]: isActive })}
            >
                <div className={styles.desktop_nav_rail_item}>
                    <span className={clsx("material-symbols-outlined", styles.desktop_nav_icon)}>family_history</span>
                    <p>Drzewo</p>
                </div>
            </NavLink>
            <NavLink
                to={RouterPath.OSOBY}
                className={({ isActive }) => clsx(styles.link, { [styles.active_link]: isActive })}
            >
                <div className={styles.desktop_nav_rail_item}>
                    <span className={clsx("material-symbols-outlined", styles.desktop_nav_icon)}>groups</span>
                    <p>Osoby</p>
                </div>
            </NavLink>
            <NavLink
                to={RouterPath.O_MNIE}
                className={({ isActive }) => clsx(styles.link, { [styles.active_link]: isActive })}
            >
                <div className={styles.desktop_nav_rail_item}>
                    <span className={clsx("material-symbols-outlined", styles.desktop_nav_icon)}>info</span>
                    <p>O nas</p>
                </div>
            </NavLink>
            <NavLink
                to={RouterPath.RODO}
                className={({ isActive }) => clsx(styles.link, { [styles.active_link]: isActive })}
            >
                <div className={styles.desktop_nav_rail_item}>
                    <span className={clsx("material-symbols-outlined", styles.desktop_nav_icon)}>policy</span>
                    <p>RODO</p>
                </div>
            </NavLink>
            <NavLink
                to={RouterPath.KONTAKT}
                className={({ isActive }) => clsx(styles.link, { [styles.active_link]: isActive })}
            >
                <div className={styles.desktop_nav_rail_item}>
                    <span className={clsx("material-symbols-outlined", styles.desktop_nav_icon)}>contact_page</span>
                    <p>Kontakt</p>
                </div>
            </NavLink>
            <NavLink
                to={RouterPath.WSPARCIE}
                className={({ isActive }) => clsx(styles.link, { [styles.active_link]: isActive })}
            >
                <div className={styles.desktop_nav_rail_item}>
                    <span className={clsx("material-symbols-outlined", styles.desktop_nav_icon)}>crowdsource</span>
                    <p>Wsparcie</p>
                </div>
            </NavLink>
        </nav>
    );
}
