import type { StateCreator, StoreApi } from "./types.ts";

type Listener<T> = (state: T, prevState: T) => void;

type CreateStore = {
	<T>(initializer: StateCreator<T>): StoreApi<T>;
	<T>(): (initializer: StateCreator<T>) => StoreApi<T>;
};

const createStoreImpl = <T>(createState: StateCreator<T>): StoreApi<T> => {
	let state: T;
	const listeners = new Set<Listener<T>>();

	const setState: StoreApi<T>["setState"] = (partial, replace) => {
		const nextState =
			typeof partial === "function" ? (partial as (state: T) => T | Partial<T>)(state) : partial;

		if (Object.is(nextState, state)) {
			return;
		}

		const previousState = state;
		state =
			(replace ?? (typeof nextState !== "object" || nextState === null))
				? (nextState as T)
				: Object.assign({}, state, nextState);

		listeners.forEach((listener) => listener(state, previousState));
	};

	const getState = () => state;
	const getInitialState = () => initialState;

	const subscribe = (listener: Listener<T>) => {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	};

	const api: StoreApi<T> = { setState, getState, getInitialState, subscribe };
	const initialState = (state = createState(setState, getState, api));

	return api;
};

export const createStore = (<T>(createState?: StateCreator<T>) =>
	createState ? createStoreImpl(createState) : createStoreImpl) as CreateStore;
