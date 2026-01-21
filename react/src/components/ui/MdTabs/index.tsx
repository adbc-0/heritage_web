import { createContext, ReactNode, useContext, useState } from "react";
import clsx from "clsx";

type TabsContextType = {
    value: string;
    setValue: (v: string) => void;
    defaultValue?: string;
};

const TabsContext = createContext<TabsContextType | null>(null);

type TabsProps = {
    children: ReactNode;
    defaultValue?: string;
    className?: string;
};

export function Tabs({ children, defaultValue = "", className }: TabsProps) {
    const [value, setValue] = useState<string>(defaultValue);
    return (
        <TabsContext.Provider value={{ value, setValue, defaultValue }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
}

type TabsListProps = {
    children: ReactNode;
    className?: string;
};
export function TabsList({ children, className }: TabsListProps) {
    return (
        <div role="tablist" className={className}>
            {children}
        </div>
    );
}

type TabsTriggerProps = {
    value: string;
    children: ReactNode;
    className?: string;
};
export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
    const ctx = useContext(TabsContext);
    if (!ctx) {
        throw new Error("TabsTrigger must be used within Tabs");
    }
    const { setValue, value: current, defaultValue: ctxDefault } = ctx;
    const isActive = current === value || (current === "" && value === ctxDefault);
    return (
        <button
            role="tab"
            aria-selected={isActive}
            className={clsx(className, { ["active"]: isActive })}
            onClick={() => {
                setValue(value);
            }}
            type="button"
        >
            {children}
        </button>
    );
}

type TabsContentProps = {
    value: string;
    children: ReactNode;
    className?: string;
};
export function TabsContent({ value, children, className }: TabsContentProps) {
    const ctx = useContext(TabsContext);
    if (!ctx) {
        throw new Error("TabsContent must be used within Tabs");
    }
    const { value: current } = ctx;
    return (
        <div className={className} hidden={current !== value}>
            {children}
        </div>
    );
}

export default Tabs;
