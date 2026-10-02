import { create, useShallow, useStore } from "../../src/react/index.ts";

type CounterState = {
	count: number;
	inc: () => void;
};

const useCounter = create<CounterState>()((set) => ({
	count: 0,
	inc: () => set((state) => ({ count: state.count + 1 })),
}));

export function TypeChecks() {
	// @ts-expect-error — такого поля в состоянии нет
	useCounter((state) => state.nope);

	// @ts-expect-error — селектор возвращает number, а не string
	useCounter((state) => state.count) satisfies string;

	// Корректные вызовы компилируются и выводят типы
	useCounter((state) => state.count) satisfies number;
	useCounter() satisfies CounterState;
	useStore(useCounter, (state) => state.inc) satisfies () => void;
	useCounter(useShallow((state) => ({ count: state.count }))) satisfies { count: number };

	return null;
}

// Методы стора доступны на самом хуке
useCounter.setState({ count: 1 });
useCounter.getState().inc();
