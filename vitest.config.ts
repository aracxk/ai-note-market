import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/__tests__/**/*.test.ts", "tests/unit/**/*.test.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json-summary", "json", "html"],
			exclude: ["src/app/**", "**/*.test.ts", "**/__tests__/**", ".next/**"],
			thresholds: {
				"src/features/**/domain/**": {
					statements: 100,
					branches: 100,
					functions: 100,
					lines: 100,
				},
				"src/features/**/usecases/**": {
					statements: 80,
					branches: 80,
					functions: 90,
					lines: 80,
				},
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
