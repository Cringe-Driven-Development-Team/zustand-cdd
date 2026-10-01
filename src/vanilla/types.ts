type SetState<T> = {
    (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: false): void;
    (state: T | ((state: T) => T), replace: true): void;
};

export interface StoreApi<T> {
    setState: SetState<T>;
    getState: () => T;
    getInitialState: () => T;
    subscribe: (listener: (state: T, prevState: T) => void) => () => void;
}

export type ExtractState<S> = S extends { getState: () => infer T } ? T : never;

export type StateCreator<T> = (
    setState: StoreApi<T>["setState"],
    getState: StoreApi<T>["getState"],
    store: StoreApi<T>,
) => T;
