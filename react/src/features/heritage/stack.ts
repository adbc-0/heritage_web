import { isNil } from "@/lib/utils.ts";

export class Stack<T> {
    #items: T[] = [];

    pop() {
        const item = this.#items.pop();
        if (isNil(item)) {
            throw new Error("empty stack exception");
        }
        return item;
    }

    push(items: T) {
        this.#items.push(items);
    }

    isEmpty() {
        return this.#items.length === 0;
    }
}
