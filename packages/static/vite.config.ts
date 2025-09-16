import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "static",
			fileName: "index",
			formats: ["es", "cjs"],
		},
		rollupOptions: {
			external: [],
			output: {
				preserveModules: true,
				preserveModulesRoot: "src",
				exports: "named",
			},
		},
	},
	plugins: [dts()],
});
