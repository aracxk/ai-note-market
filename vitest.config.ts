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
			exclude: [
				// --- ❌ テスト除外フォルダ（Playwrightで担保） ---
				"src/app/**",
				"src/components/**",
				"src/features/*/components/**",
				"src/features/*/actions/**",
				"src/features/*/external/**",

				// --- ロジックを含まない・UI寄りのフォルダ除外 ---
				"src/features/*/hooks/**",
				"src/features/*/schemas/**",
				"src/shared/schemas/**",
				"src/lib/**",

				// --- 設定・ビルド関連の除外 ---
				"tests/e2e/**",
				"playwright.config.ts",
				"next.config.mjs",
				"postcss.config.mjs",
				"**/*.test.ts",
				"**/__tests__/**",
				".next/**",
			],
			thresholds: {
				"src/features/**/domain/**": {
					statements: 100,
					branches: 100,
					functions: 100,
					lines: 100,
				},
				"src/features/**/usecases/**": {
					statements: 90,
					branches: 85,
					functions: 100,
					lines: 90,
				},
				"src/features/**/queries/**": {
					statements: 100,
					branches: 100,
					functions: 100,
					lines: 100,
				},
				"src/features/**/infrastructure/**": {
					statements: 90,
					branches: 90,
					functions: 90,
					lines: 90,
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
