export default defineNuxtConfig({
  devtools: { enabled: true },

  ssr: false,

  runtimeConfig: {
    public: {
      appName: process.env.NUXT_APP_NAME,
      apiUrl: process.env.NUXT_API_URL,

      directus: { url: "" },
    },
  },

  build: {
    transpile: ["vuetify"],
  },

  modules: [
    "vuetify-nuxt-module",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@nuxtjs/i18n",
    "dayjs-nuxt",
    "nuxt-svgo",
    "nuxt-echarts",
  ],

  plugins: [],

  components: [{ path: "~/components/ui", global: true, prefix: "ui" }],

  css: [
    "animate.css/animate.min.css",
    "@flaticon/flaticon-uicons/css/all/all.css",
    "./styles/main.scss",
  ],

  svg: { component: "uiSvg" },

  app: {
    head: {
      titleTemplate: "%s %separator %siteName %separator %siteDescription",
      templateParams: {
        siteName: "Sya",
        siteDescription: null,
        separator: "·",
      },
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
      meta: [{ property: "og:image", content: "/og-image.png" }],
    },
  },

  i18n: {
    compilation: { strictMessage: false },
    strategy: "no_prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root", // recommended
    },
    defaultLocale: "fr",
    locales: [
      {
        code: "fr",
        language: "fr",
        name: "Français",
        file: "fr.json",
      },
      {
        code: "en",
        language: "en",
        name: "English",
        file: "en.json",
      },
    ],
  },

  piniaPersistedstate: { storage: "localStorage" },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler", // or "modern"
        },
      },
    },
  },

  compatibilityDate: "2024-11-10",

  vuetify: {
    moduleOptions: {},
    vuetifyOptions: "./vuetify.config.ts",
  },
});
