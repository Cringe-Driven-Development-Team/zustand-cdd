import { defineConfig } from "tsdown";

export default defineConfig({
	entry: {
		index: "src/react/index.ts",
		vanilla: "src/vanilla/index.ts",
	},
	format: ["esm"],
	dts: true,
	clean: true,
	deps: { neverBundle: ["@maninthecoat/react"] },
});
