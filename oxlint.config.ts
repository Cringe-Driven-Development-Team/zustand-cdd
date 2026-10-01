import { defineConfig } from "oxlint";

export default defineConfig({
	plugins: ["typescript", "react"],
	categories: { correctness: "error" },
	rules: {
		"react/rules-of-hooks": "error",
		"react/exhaustive-deps": "error",
	},
	ignorePatterns: ["dist/", "node_modules/"],
});
