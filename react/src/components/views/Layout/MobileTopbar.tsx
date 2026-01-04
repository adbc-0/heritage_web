import { useState } from "react";
import { preload } from "react-dom";
import { useLocation, useNavigate } from "react-router";
import { clsx } from "clsx";

import { RouterPath } from "@/constants/routePaths.ts";
import { useGlobalSearch } from "@/features/globalSearch/globalSearch.ts";

import LOGO from "@/assets/logo.svg";
import styles from "./styles.module.css";

export function MobileTopbar() {
    preload(LOGO, { as: "image", type: "image/svg+xml" });

    const location = useLocation();
    const navigate = useNavigate();
    const { query, searchResults, search } = useGlobalSearch();

    const [searchOpen, setSearchOpen] = useState(false);

    const dockedContainer = searchOpen && searchResults.length > 0;
    const moreResultsText = searchResults.length > 5;

    return (
        <>
            <nav className={styles.top_bar}>
                <div className={styles.input_wrapper}>
                    <input
                        name="global_search"
                        className={clsx(styles.search, {
                            [styles.open_search]: dockedContainer,
                        })}
                        type="text"
                        placeholder="Szukaj"
                        value={query}
                        onChange={(e) => {
                            search(e.target.value);
                        }}
                        onFocus={() => {
                            setSearchOpen(true);
                        }}
                        onBlur={() => {
                            setSearchOpen(false);
                        }}
                    />
                    <div className={styles.leading_icon}>
                        <button
                            type="button"
                            className={clsx("material-symbols-outlined", styles.leading_icon_style)}
                            command="show-modal"
                            commandFor="navigation_rail"
                        >
                            menu
                        </button>
                    </div>
                    <div className={styles.trailing_icon}>
                        <span className={clsx("material-symbols-outlined", styles.trailing_icon_style)}>search</span>
                    </div>
                    <div className={styles.docked_container}>
                        {dockedContainer && (
                            <>
                                <div className={styles.search_list}>
                                    {searchResults.slice(0, 5).map((person) => (
                                        <button
                                            key={person.id}
                                            className={clsx(styles.search_list_item, {
                                                [styles.has_last_list_element]: !moreResultsText,
                                            })}
                                            type="button"
                                        >
                                            {person.firstName} {person.nickName} {person.lastName}
                                        </button>
                                    ))}
                                </div>
                                {moreResultsText && (
                                    <>
                                        <div className={styles.break_line} />
                                        <button className={clsx(styles.search_list_item, styles.has_last_list_element)}>
                                            Zobacz pozostałe wyniki ({searchResults.length - 5})
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </nav>
            <dialog id="navigation_rail" closedby="any" className={styles.modal}>
                <ul className={styles.navigation_rail}>
                    <button
                        type="button"
                        className={clsx(styles.navigation_item, {
                            [styles.active_navigation_item]: location.pathname === RouterPath.ROOT,
                        })}
                        command="close"
                        commandFor="navigation_rail"
                        onClick={() => {
                            void navigate(RouterPath.ROOT);
                        }}
                    >
                        <span className={clsx("material-symbols-outlined", styles.navigation_item_icon)}>
                            family_history
                        </span>
                        <span className={styles.navigation_item_text}>Drzewo</span>
                    </button>
                    <button
                        type="button"
                        className={clsx(styles.navigation_item, {
                            [styles.active_navigation_item]: location.pathname === RouterPath.OSOBY,
                        })}
                        command="close"
                        commandFor="navigation_rail"
                        onClick={() => {
                            void navigate(RouterPath.OSOBY);
                        }}
                    >
                        <span className={clsx("material-symbols-outlined", styles.navigation_item_icon)}>groups</span>
                        <span className={styles.navigation_item_text}>Osoby</span>
                    </button>
                    <button
                        type="button"
                        className={clsx(styles.navigation_item, {
                            [styles.active_navigation_item]: location.pathname === RouterPath.O_MNIE,
                        })}
                        command="close"
                        commandFor="navigation_rail"
                        onClick={() => {
                            void navigate(RouterPath.O_MNIE);
                        }}
                    >
                        <span className={clsx("material-symbols-outlined", styles.navigation_item_icon)}>info</span>
                        <span className={styles.navigation_item_text}>O nas</span>
                    </button>
                    <button
                        type="button"
                        className={clsx(styles.navigation_item, {
                            [styles.active_navigation_item]: location.pathname === RouterPath.RODO,
                        })}
                        command="close"
                        commandFor="navigation_rail"
                        onClick={() => {
                            void navigate(RouterPath.RODO);
                        }}
                    >
                        <span className={clsx("material-symbols-outlined", styles.navigation_item_icon)}>policy</span>
                        <span className={styles.navigation_item_text}>RODO</span>
                    </button>
                    <button
                        type="button"
                        className={clsx(styles.navigation_item, {
                            [styles.active_navigation_item]: location.pathname === RouterPath.KONTAKT,
                        })}
                        command="close"
                        commandFor="navigation_rail"
                        onClick={() => {
                            void navigate(RouterPath.KONTAKT);
                        }}
                    >
                        <span className={clsx("material-symbols-outlined", styles.navigation_item_icon)}>
                            contact_page
                        </span>
                        <span className={styles.navigation_item_text}>Kontakt</span>
                    </button>
                    <button
                        type="button"
                        className={clsx(styles.navigation_item, {
                            [styles.active_navigation_item]: location.pathname === RouterPath.WSPARCIE,
                        })}
                        command="close"
                        commandFor="navigation_rail"
                        onClick={() => {
                            void navigate(RouterPath.WSPARCIE);
                        }}
                    >
                        <span className={clsx("material-symbols-outlined", styles.navigation_item_icon)}>
                            crowdsource
                        </span>
                        <span className={styles.navigation_item_text}>Wsparcie</span>
                    </button>
                </ul>
            </dialog>
        </>
    );
}
