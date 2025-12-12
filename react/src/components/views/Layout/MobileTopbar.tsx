import { ElementRef, useRef, useState } from "react";
import { preload } from "react-dom";

import { useGlobalSearch } from "@/features/globalSearch/globalSearch.ts";

import LOGO from "@/assets/logo.svg";

import styles from "./styles.module.css";

// const sidebarNavlinkStyle = ({ isActive }: NavLinkRenderProps) =>
//     isActive
//         ? "flex gap-2 p-2 bg-highlight-background text-highlight rounded-md"
//         : "flex gap-2 p-2 bg-background text-foreground rounded-md";

export function MobileTopbar() {
    preload(LOGO, { as: "image", type: "image/svg+xml" });

    const dialogRef = useRef<ElementRef<"dialog">>(null);

    const { query, searchResults, search } = useGlobalSearch();

    // const [navbarOpen, setNavbarOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <>
            <nav className={styles.top_bar}>
                <div className={styles.search_input_wrapper}>
                    <button
                        type="button"
                        className={styles.search_input}
                        onClick={() => {
                            // setSearchOpen(true);
                            dialogRef.current.showModal();
                        }}
                    >
                        <span>Szukaj</span>
                    </button>
                    {/*<input name="global_search" className={styles.search_input} type="text" placeholder="Szukaj" />*/}
                    {/*<span>SideBar icon</span>*/}
                    {/*<span>Search icon</span>*/}
                </div>
            </nav>
            <dialog ref={dialogRef} closedby="any" className={styles.modal}>
                <div>
                    <div className={styles.active_search_input_section}>
                        <button
                            className={styles.active_search_button}
                            onClick={() => {
                                setSearchOpen(false);
                            }}
                        >
                            ‹
                        </button>
                        <input
                            // /* eslint-disable-next-line jsx-a11y/no-autofocus */
                            // autoFocus
                            type="text"
                            placeholder="Szukaj"
                            className={styles.active_search_input}
                            value={query}
                            onChange={(e) => {
                                search(e.target.value);
                            }}
                        />
                    </div>
                    <hr className={styles.active_search_break} />
                    {searchResults.map((person) => (
                        <div key={person.id} className={styles.list_item}>
                            {person.firstName} {person.lastName}
                        </div>
                    ))}
                </div>
            </dialog>
        </>
    );
}

// instead of using dialogs I could conditionally change style on input focus
