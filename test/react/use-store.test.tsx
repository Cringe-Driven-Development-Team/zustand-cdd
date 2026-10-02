import { describe, expect, test } from "bun:test";
import { useLayoutEffect } from "@maninthecoat/react";
import { create, createStore, useShallow, useStore } from "../../src/react/index.ts";
import { flush, mount } from "./utils.ts";

type CounterState = {
	count: number;
	step: number;
	inc: () => void;
};

const createCounter = () =>
	create<CounterState>()((set) => ({
		count: 0,
		step: 1,
		inc: () => set((state) => ({ count: state.count + state.step })),
	}));

describe("useStore", () => {
	test("компонент с селектором не перерисовывается от чужих полей", async () => {
		const useCounter = createCounter();
		let renders = 0;
		function CountOnly() {
			renders += 1;
			const count = useCounter((state) => state.count);
			return <p>{count}</p>;
		}

		const { container, unmount } = await mount(<CountOnly />);
		expect(renders).toBe(1);

		useCounter.setState({ step: 2 });
		await flush();
		expect(renders).toBe(1);

		useCounter.getState().inc();
		await flush();
		expect(renders).toBe(2);
		expect(container.textContent).toBe("2");

		await unmount();
	});

	test("компонент только с экшеном не перерисовывается", async () => {
		const useCounter = createCounter();
		let renders = 0;
		function IncButton() {
			renders += 1;
			const inc = useCounter((state) => state.inc);
			return <button onClick={inc}>+</button>;
		}

		const { unmount } = await mount(<IncButton />);
		useCounter.getState().inc();
		useCounter.setState({ step: 5 });
		useCounter.setState({});
		await flush();

		expect(renders).toBe(1);
		await unmount();
	});

	test("useShallow перерисовывает только на выбранные поля", async () => {
		const useProfile = create<{ name: string; city: string; age: number }>()(() => ({
			name: "Ерофей",
			city: "Москва",
			age: 19,
		}));
		let renders = 0;
		function NameAndCity() {
			renders += 1;
			const { name, city } = useProfile(
				useShallow((state) => ({ name: state.name, city: state.city })),
			);
			return (
				<p>
					{name} {city}
				</p>
			);
		}

		const { container, unmount } = await mount(<NameAndCity />);
		expect(renders).toBe(1);

		useProfile.setState((state) => ({ age: state.age + 1 }));
		await flush();
		expect(renders).toBe(1);

		useProfile.setState({ name: "Денис" });
		await flush();
		expect(renders).toBe(2);

		useProfile.setState({ city: "Казань" });
		await flush();
		expect(renders).toBe(3);
		expect(container.textContent).toBe("Денис Казань");

		await unmount();
	});

	test("изменение между рендером и подпиской не теряется", async () => {
		const useCounter = createCounter();
		function Child() {
			useLayoutEffect(() => {
				useCounter.setState({ count: 42 });
			}, []);
			return null;
		}
		function Parent() {
			const count = useCounter((state) => state.count);
			return (
				<div>
					<p>{count}</p>
					<Child />
				</div>
			);
		}

		const { container, unmount } = await mount(<Parent />);
		expect(container.textContent).toBe("42");

		await unmount();
	});

	test("после размонтирования подписчиков нет", async () => {
		const store = createStore<{ count: number }>()(() => ({ count: 0 }));
		let active = 0;
		const subscribe = store.subscribe;
		store.subscribe = (listener) => {
			active += 1;
			const unsubscribe = subscribe(listener);
			return () => {
				active -= 1;
				unsubscribe();
			};
		};
		function Count() {
			const count = useStore(store, (state) => state.count);
			return <p>{count}</p>;
		}

		const { unmount } = await mount(
			<div>
				<Count />
				<Count />
			</div>,
		);
		expect(active).toBe(2);

		await unmount();
		expect(active).toBe(0);
	});

	test("селектор с новым объектом не падает", async () => {
		const useCounter = createCounter();
		let renders = 0;
		function Broken() {
			renders += 1;
			const { count } = useCounter((state) => ({ count: state.count }));
			return <p>{count}</p>;
		}

		const { container, unmount } = await mount(<Broken />);
		expect(renders).toBe(1);

		useCounter.getState().inc();
		await flush();
		expect(renders).toBe(2);
		expect(container.textContent).toBe("1");

		await unmount();
	});
});
