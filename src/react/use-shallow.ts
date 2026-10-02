import { useMemo } from "@maninthecoat/react";
import { shallow } from "../vanilla/index.ts";

function createShallowMemo<U>() {
	let previous: U | undefined;

	return (next: U): U => {
		if (shallow(previous, next)) {
			return previous as U;
		}

		previous = next;
		return next;
	};
}

export function useShallow<S, U>(selector: (state: S) => U): (state: S) => U {
	const memo = useMemo(() => createShallowMemo<U>(), []);

	return (state) => memo(selector(state));
}
