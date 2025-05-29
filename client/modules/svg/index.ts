import {
  addComponent,
  addComponentsDir,
  addPluginTemplate,
  createResolver,
  defineNuxtModule,
  resolveAlias,
} from "nuxt/kit";
import fsp from "node:fs";
import { optimize, type Config } from "svgo";

export interface Options {
  output: string;
  path: string;
  paths: string[];
  component: string;
  svgo?: Config;
}

export default defineNuxtModule<Options>({
  meta: {
    name: "nuxt-svg",
    configKey: "svg",
  },

  defaults: {
    component: "nuxtSvg",
    path: "~/assets/svgs",
    paths: [],
    output: "~/assets/.svgs",
    svgo: {
      plugins: [
        { name: "removeDimensions" },
        { name: "removeXMLProcInst" }, // ⛔ supprime <?xml ...?>
        { name: "removeDoctype" }, // ⛔ supprime <!DOCTYPE svg>
        { name: "removeTitle" },
      ],
    },
  },

  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    const inputDirs = [
      ...options.paths.map((path) => resolveAlias(path, nuxt.options.alias)),
      resolveAlias(options.path, nuxt.options.alias),
    ];

    resolveAlias(options.output, nuxt.options.alias);
    const output = `${nuxt.options.rootDir}/assets/.svgs`.replace(
      /~\/|\.\//,
      ""
    );
    fsp.rmSync(output, { recursive: true, force: true });

    addPluginTemplate({
      filename: "svg-public.config.ts",
      getContents: () => `
        export default defineNuxtPlugin(() => {
          return {
            provide: {
              svgOptions: ${JSON.stringify(options)}
            }
          }
        })
      `,
    });

    addComponent({
      name: options.component,
      global: true,
      filePath: resolve("./component.vue"),
    });

    addComponentsDir({
      prefix: options.component,
      global: true,
      path: output,
      extensions: ["vue"],
    });

    async function buildSvgs() {
      if (fsp.existsSync(output)) {
        fsp.rmSync(output, { recursive: true, force: true });
      }

      fsp.mkdirSync(output, { recursive: true });
      fsp.writeFileSync(`${output}/.gitignore`, "*");

      async function buildSvg(dir: string) {
        if (!fsp.existsSync(dir)) return;

        const files = fsp.readdirSync(dir, { recursive: true });

        for (const file of files) {
          if (typeof file === "string") {
            const name = file.replace(/\\/g, "/").replace(/\/\//g, "/");

            if (fsp.lstatSync(`${dir}/${name}`).isDirectory()) {
              fsp.mkdirSync(`${output}/${name}`, { recursive: true });
            } else {
              const content = fsp.readFileSync(`${dir}/${name}`, "utf-8");
              const optimized = optimize(content, options.svgo);

              fsp.writeFileSync(
                `${output}/${name}`.replace(/.svg$/, ".vue"),
                `<template>${optimized.data}</template>`,
                "utf-8"
              );
            }
          }
        }
      }

      for (const dir of inputDirs) {
        await buildSvg(dir);
      }
    }

    if (nuxt.options.dev) {
      for (const dir of inputDirs) {
        if (fsp.existsSync(dir)) fsp.watch(dir, buildSvgs);
      }
    }

    nuxt.hook("nitro:init", async () => await buildSvgs());
  },
});
