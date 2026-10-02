# @maninthecoat/zustand

[![npm](https://img.shields.io/npm/v/@maninthecoat/zustand)](https://www.npmjs.com/package/@maninthecoat/zustand)

Учебный аналог [Zustand](https://github.com/pmndrs/zustand) для [`@maninthecoat/react`](https://www.npmjs.com/package/@maninthecoat/react). Названия и сигнатуры совпадают с Zustand 5, поэтому код переносится заменой импорта.

npm: https://www.npmjs.com/package/@maninthecoat/zustand

## Установка

```sh
bun add @maninthecoat/zustand @maninthecoat/react
```

## React

```tsx
import { create, useShallow } from "@maninthecoat/zustand";

type CounterState = {
	count: number;
	step: number;
	inc: () => void;
};

const useCounter = create<CounterState>()((set) => ({
	count: 0,
	step: 1,
	inc: () => set((state) => ({ count: state.count + state.step })),
}));

function Counter() {
	// Перерисовка только при изменении count
	const count = useCounter((state) => state.count);
	const inc = useCounter((state) => state.inc);
	return <button onClick={inc}>{count}</button>;
}

function Summary() {
	// Селектор возвращает новый объект: сравниваем поверхностно
	const { count, step } = useCounter(useShallow((state) => ({ count: state.count, step: state.step })));
	return <p>{count} / {step}</p>;
}
```

Хук `useCounter` одновременно является стором: `useCounter.getState()`, `useCounter.setState(...)`, `useCounter.subscribe(...)`. Для стора, созданного через `createStore`, есть `useStore(store, selector?)`.

## Без React

Точка входа `/vanilla` не импортирует React.

```ts
import { createStore } from "@maninthecoat/zustand/vanilla";

const store = createStore<{ count: number }>()(() => ({ count: 0 }));

const unsubscribe = store.subscribe((state, prevState) => {
	console.log(prevState.count, "→", state.count);
});

store.setState({ count: 1 }); // поверхностное слияние
store.setState((state) => ({ count: state.count + 1 }));
store.setState(store.getInitialState(), true); // полная замена
unsubscribe();
```

## API

| Экспорт | Что делает |
| --- | --- |
| `createStore(initializer)` | Стор с `getState`, `getInitialState`, `setState(partial, replace?)`, `subscribe` |
| `create(initializer)` | То же, плюс хук `useBoundStore(selector?)` |
| `useStore(store, selector?)` | Подписка компонента на произвольный стор |
| `useShallow(selector)` | Не перерисовывает, если результат селектора поверхностно равен прошлому |
| `shallow(a, b)` | Поверхностное сравнение |

## Отличия от Zustand

- Хуки построены на `useState` + `useLayoutEffect`, без `useSyncExternalStore`. В конкурентном режиме теоретически возможен «tearing».
- Нет middleware (`persist`, `devtools`, `immer`) и сторов через Context.

## Разработка

```sh
bun install
bun run test       # vanilla без DOM + хуки на happy-dom
bun run typecheck
bun run lint
bun run build
```
