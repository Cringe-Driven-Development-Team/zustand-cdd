import { createStore, type StateCreator, type StoreApi } from "../vanilla/index.ts";
import { useStore } from "./use-store.ts";

export type UseBoundStore<T> = {
	(): T;
	<U>(selector: (state: T) => U): U;
} & StoreApi<T>;

type Create = {
	<T>(initializer: StateCreator<T>): UseBoundStore<T>;
	<T>(): (initializer: StateCreator<T>) => UseBoundStore<T>;
};

const createImpl = <T>(createState: StateCreator<T>): UseBoundStore<T> => {
	const api = createStore(createState);
	const useBoundStore = (selector?: (state: T) => unknown) =>
		useStore(api, selector as (state: T) => unknown);

	return Object.assign(useBoundStore, api) as UseBoundStore<T>;
};

export const create = (<T>(createState?: StateCreator<T>) =>
	createState ? createImpl(createState) : createImpl) as Create;
