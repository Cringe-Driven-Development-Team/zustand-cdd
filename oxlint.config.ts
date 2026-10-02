import { defineConfig } from "oxlint";

export default defineConfig({
	plugins: ["typescript", "react"],
	categories: { correctness: "error" },
	rules: {
		"react/rules-of-hooks": "error",
		"react/exhaustive-deps": "error",
	},
	overrides: [
		{
			files: ["test/react/**"],
			rules: { "react/globals": "off" },
		},
	],
	ignorePatterns: ["dist/", "node_modules/"],
});
