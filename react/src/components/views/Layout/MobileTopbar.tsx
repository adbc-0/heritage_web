import { useEffect, useRef } from "react";
import { preload } from "react-dom";
import { useLocation, useNavigate } from "react-router";
import { clsx } from "clsx";

import { RouterPath } from "@/constants/routePaths.ts";
import { useGlobalSearch } from "@/features/globalSearch/globalSearch.ts";

import { MdIconButton } from "@/components/ui/MdIconButton/MdIconButton";

import LOGO from "@/assets/logo.svg";

import styles from "./styles.module.css";

export function MobileTopbar() {
    preload(LOGO, { as: "image", type: "image/svg+xml" });

    const mobileSearchInputRef = useRef<HTMLInputElement>(null);
    const mobileSearchDialogRef = useRef<HTMLDialogElement>(null);
    const navigationRailDialogRef = useRef<HTMLDialogElement>(null);

    // close dialog on clicking backdrop
    // maybe in the future closedby="any" won't be leaking events through backdrop
    useEffect(() => {
        const dialog = navigationRailDialogRef.current;

        if (!dialog) {
            throw new Error("missing dialog element reference");
        }

        const onDialogClick = (event: MouseEvent) => {
            if (event.target === dialog) {
                dialog.close("light-dismiss");
            }
        };

        dialog.addEventListener("click", onDialogClick);

        return () => {
            dialog.removeEventListener("click", onDialogClick);
        };
    }, []);

    const location = useLocation();
    const navigate = useNavigate();
    const { query, searchResults, search, clear } = useGlobalSearch();

    const moreResultsText = searchResults.length > 5;

    return (
        <nav className={styles.top_bar}>
            {location.pathname !== RouterPath.OSOBY ? (
                <div className={styles.input_wrapper}>
                    <button
                        type="button"
                        className={clsx("material-symbols-outlined", styles.leading_icon_style)}
                        command="show-modal"
                        commandfor="navigation_rail"
                    >
                        menu
                    </button>
                    <button
                        type="button"
                        className={styles.search}
                        onClick={() => {
                            if (!mobileSearchDialogRef.current) {
                                throw new Error("missing element reference: mobileSearchDialogRef");
                            }
                            if (!mobileSearchInputRef.current) {
                                throw new Error("missing element reference: mobileSearchInputRef");
                            }
                            mobileSearchDialogRef.current.showModal();
                            mobileSearchInputRef.current.focus();
                        }}
                    >
                        Szukaj
                    </button>
                </div>
            ) : (
                <div className={styles.simple_menu_wrapper}>
                    <button
                        type="button"
                        className={clsx("material-symbols-outlined", styles.simple_menu_icon)}
                        command="show-modal"
                        commandfor="navigation_rail"
                    >
                        menu
                    </button>
                </div>
            )}
            <dialog ref={mobileSearchDialogRef} className={styles.search_dialog} id="search_dialog" closedby="any">
                <div>
                    <div className={styles.search_open_block}>
                        <MdIconButton
                            iconName="arrow_back"
                            className={styles.mobile_search_back_button}
                            command="close"
                            commandfor="search_dialog"
                        />
                        <input
                            ref={mobileSearchInputRef}
                            autoComplete="off"
                            name="global_search"
                            className={clsx(styles.mobile_search)}
                            type="text"
                            placeholder="Szukaj"
                            value={query}
                            onChange={(e) => {
                                search(e.target.value);
                            }}
                        />
                    </div>
                    <div className={styles.break_line} />
                    <div className={styles.search_list}>
                        {searchResults.slice(0, 5).map((person) => (
                            <button
                                key={person.id}
                                type="button"
                                className={clsx(styles.search_list_item, {
                                    [styles.has_last_list_element as unknown as string]: !moreResultsText,
                                })}
                                onMouseDown={() => {
                                    if (!mobileSearchDialogRef.current) {
                                        throw new Error("missing element reference: mobileSearchDialogRef");
                                    }
                                    mobileSearchDialogRef.current.close();
                                    void navigate(`/osoby/${person.id}`);
                                    clear();
                                }}
                            >
                                {person.firstName} {person.nickName} {person.lastName}
                            </button>
                        ))}
                    </div>
                    {moreResultsText && (
                        <>
                            <div className={styles.break_line} />
                            <button
                                className={clsx(styles.search_list_item, styles.has_last_list_element)}
                                onMouseDown={() => {
                                    if (!mobileSearchDialogRef.current) {
                                        throw new Error("missing element reference: mobileSearchDialogRef");
                                    }
                                    mobileSearchDialogRef.current.close();
                                    void navigate(`${RouterPath.OSOBY}?search=${query}`);
                                    clear();
                                }}
                            >
                                Zobacz pozostałe wyniki ({searchResults.length - 5})
                            </button>
                        </>
                    )}
                </div>
            </dialog>
            <dialog ref={navigationRailDialogRef} id="navigation_rail" closedby="closerequest" className={styles.modal}>
                <ul className={styles.navigation_rail}>
                    <button
                        type="button"
                        className={clsx(styles.navigation_item, {
                            [styles.active_navigation_item as unknown as string]: location.pathname === RouterPath.ROOT,
                        })}
                        command="close"
                        commandfor="navigation_rail"
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
                            [styles.active_navigation_item as unknown as string]:
                                location.pathname === RouterPath.OSOBY,
                        })}
                        command="close"
                        commandfor="navigation_rail"
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
                            [styles.active_navigation_item as unknown as string]:
                                location.pathname === RouterPath.O_MNIE,
                        })}
                        command="close"
                        commandfor="navigation_rail"
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
                            [styles.active_navigation_item as unknown as string]: location.pathname === RouterPath.RODO,
                        })}
                        command="close"
                        commandfor="navigation_rail"
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
                            [styles.active_navigation_item as unknown as string]:
                                location.pathname === RouterPath.KONTAKT,
                        })}
                        command="close"
                        commandfor="navigation_rail"
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
                            [styles.active_navigation_item as unknown as string]:
                                location.pathname === RouterPath.WSPARCIE,
                        })}
                        command="close"
                        commandfor="navigation_rail"
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
        </nav>
    );
}
