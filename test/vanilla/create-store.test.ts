import { describe, expect, mock, test } from "bun:test";
import { createStore } from "../../src/vanilla/index.ts";

type ProfileState = {
	user: { name: string; role: string };
	theme: "light" | "dark";
	toggleTheme: () => void;
};

const createProfileStore = () =>
	createStore<ProfileState>()((set) => ({
		user: { name: "Ерофей", role: "frontend" },
		theme: "light",
		toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
	}));

describe("createStore", () => {
	test("работает без DOM", () => {
		expect(typeof document).toBe("undefined");
	});

	test("setState сливает только верхний уровень", () => {
		const store = createProfileStore();
		const before = store.getState();

		store.setState({ user: { name: "Денис" } } as never);

		expect(store.getState()).not.toBe(before);
		expect(store.getState().user).toEqual({ name: "Денис" } as ProfileState["user"]);
		expect(store.getState().theme).toBe("light");
		expect(typeof store.getState().toggleTheme).toBe("function");
	});

	test("replace заменяет состояние целиком", () => {
		const store = createProfileStore();
		const next = { user: { name: "Дарья", role: "backend" }, theme: "dark" } as ProfileState;

		store.setState(next, true);

		expect(store.getState()).toBe(next);
		expect(store.getState().toggleTheme).toBeUndefined();
	});

	test("getInitialState возвращает начальное состояние", () => {
		const store = createProfileStore();
		const initial = store.getState();

		store.getState().toggleTheme();

		expect(store.getInitialState()).toBe(initial);
		expect(store.getState().theme).toBe("dark");

		store.setState(store.getInitialState(), true);
		expect(store.getState()).toBe(initial);
	});

	test("подписчик получает (state, prevState)", () => {
		const store = createStore<{ count: number }>()(() => ({ count: 0 }));
		const listener = mock();
		store.subscribe(listener);
		const prev = store.getState();

		store.setState({ count: 1 });

		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith(store.getState(), prev);
		expect(store.getState().count).toBe(1);
	});

	test("подписчик вызывается на setState({})", () => {
		const store = createStore<{ count: number }>()(() => ({ count: 0 }));
		const listener = mock();
		store.subscribe(listener);

		store.setState({});

		expect(listener).toHaveBeenCalledTimes(1);
	});

	test("подписчик молчит на setState((s) => s)", () => {
		const store = createStore<{ count: number }>()(() => ({ count: 0 }));
		const listener = mock();
		store.subscribe(listener);
		const before = store.getState();

		store.setState((state) => state);

		expect(listener).not.toHaveBeenCalled();
		expect(store.getState()).toBe(before);
	});

	test("отписка во время рассылки", () => {
		const store = createStore<{ count: number }>()(() => ({ count: 0 }));
		const calls: string[] = [];

		const unsubscribeSelf = store.subscribe(() => {
			calls.push("self");
			unsubscribeSelf();
		});
		store.subscribe(() => {
			calls.push("a");
			unsubscribeB();
		});
		const unsubscribeB = store.subscribe(() => calls.push("b"));

		store.setState({ count: 1 });
		expect(calls).toEqual(["self", "a"]);

		store.setState({ count: 2 });
		expect(calls).toEqual(["self", "a", "a"]);
	});

	test("get() в экшенах читает актуальное состояние", () => {
		const store = createStore<{ count: number; inc: () => void; double: () => void }>()(
			(set, get) => ({
				count: 1,
				inc: () => set((state) => ({ count: state.count + 1 })),
				double: () => set({ count: get().count * 2 }),
			}),
		);

		store.getState().inc();
		store.getState().double();

		expect(store.getState().count).toBe(4);
	});

	test("async-экшены", async () => {
		type State = {
			status: "idle" | "loading" | "done" | "error";
			load: (fail: boolean) => Promise<void>;
		};
		const store = createStore<State>()((set) => ({
			status: "idle",
			load: async (fail) => {
				set({ status: "loading" });
				await Promise.resolve();
				set({ status: fail ? "error" : "done" });
			},
		}));
		const statuses: string[] = [];
		store.subscribe((state) => statuses.push(state.status));

		await store.getState().load(false);
		await store.getState().load(true);

		expect(statuses).toEqual(["loading", "done", "loading", "error"]);
	});
});
