import { createRoot, type ReactElement } from "@maninthecoat/react";

export async function flush(): Promise<void> {
	for (let i = 0; i < 5; i += 1) {
		await new Promise((resolve) => setTimeout(resolve, 0));
	}
}

export async function mount(element: ReactElement) {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	root.render(element);
	await flush();

	return {
		container,
		unmount: async () => {
			root.unmount();
			await flush();
		},
	};
}
