import { createContext, ReactElement, useContext, useState } from "react";
import clsx from "clsx";

interface ReactChildren {
    children: ReactElement | ReactElement[];
}

type TabsContextType = {
    value: string;
    setValue: (v: string) => void;
    defaultValue?: string;
};

const TabsContext = createContext<TabsContextType | null>(null);

function useTabs() {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error("useTabs must be used within Tabs");
    }
    return context;
}

interface TabsProps extends ReactChildren {
    defaultValue: string;
    className?: string;
}

export function Tabs({ children, defaultValue, className }: TabsProps) {
    const [value, setValue] = useState(defaultValue);
    return (
        <TabsContext.Provider value={{ value, setValue, defaultValue }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
}

interface TabsListProps extends ReactChildren {
    className?: string;
}
export function TabsList({ children, className }: TabsListProps) {
    return (
        <div role="tablist" className={className}>
            {children}
        </div>
    );
}

interface TabsTriggerProps {
    children: string;
    value: string;
    className?: string;
}
export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
    const { setValue, value: current } = useTabs();
    const isActive = current === value;
    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            className={clsx(className)}
            onClick={() => {
                setValue(value);
            }}
        >
            {children}
        </button>
    );
}

interface TabsContentProps extends ReactChildren {
    value: string;
    className?: string;
}
export function TabsContent({ value, children, className }: TabsContentProps) {
    const { value: current } = useTabs();
    const renderContent = current === value;
    if (!renderContent) {
        return;
    }
    return <div className={className}>{children}</div>;
}

export default Tabs;
