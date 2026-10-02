import { useLayoutEffect, useState } from "@maninthecoat/react";
import type { StoreApi } from "../vanilla/index.ts";

const identity = <T>(value: T): T => value;

export function useStore<T>(api: StoreApi<T>): T;
export function useStore<T, U>(api: StoreApi<T>, selector: (state: T) => U): U;
export function useStore<T, U>(
    api: StoreApi<T>,
    selector: (state: T) => U = identity as unknown as (state: T) => U,
): U {
    const state = api.getState();
    const slice = selector(state);
    const [, forceRender] = useState(0);

    useLayoutEffect(() => {
        const check = () => {
            const nextState = api.getState();
            if (Object.is(nextState, state)) {
                return;
            }

            if (Object.is(selector(nextState), slice)) {
                return;
            }

            forceRender((count) => count + 1);
        };

        const unsubscribe = api.subscribe(check);
        check();

        return unsubscribe;
    }, [api, state, selector, slice]);

    return slice;
}
