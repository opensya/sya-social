import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["main.ts"],
  outDir: "dist",
  format: ["cjs"], // pour commonjs, selon ton tsconfig
  target: "es2021",
  clean: true,
  dts: false,
  sourcemap: false,
  esbuildOptions(options) {
    options.alias = {
      database: "./database",
      utils: "./utils",
      app: "./apps",
      decorators: "./decorators",
      interceptors: "./global",
    };
  },
});
