import { FamilyGraph } from "@/features/FamilyGraph/FamilyGraph";
import { type Params, useParams } from "react-router";

// ToDo: what will happen with ozimki root. Will dummy node be rendered?
export function Tree() {
    const { id: personId } = useParams<Params>();

    if (!personId) {
        throw new Error("cannot draw tree for blank person");
    }

    return (
        <div className="bg-background border-t border-border h-full">
            <FamilyGraph rootPerson={personId} />
        </div>
    );
}
