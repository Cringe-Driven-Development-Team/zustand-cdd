import { createStore } from "../../src/vanilla/index.ts";

type ProfileState = {
	user: { name: string; role: string };
	theme: "light" | "dark";
	toggleTheme: () => void;
};

const store = createStore<ProfileState>()((set) => ({
	user: { name: "Ерофей", role: "frontend" },
	theme: "light",
	toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
}));

// @ts-expect-error — вложенный partial без обязательного role
store.setState({ user: { name: "Денис" } });

// @ts-expect-error — replace без экшена toggleTheme
store.setState({ user: { name: "Дарья", role: "backend" }, theme: "dark" }, true);

// Корректные вызовы компилируются
store.setState({ theme: "dark" });
store.setState((state) => ({ user: { ...state.user, name: "Денис" } }));
store.setState({ ...store.getInitialState(), theme: "dark" }, true);
