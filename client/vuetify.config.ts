import type { ExternalVuetifyOptions } from "vuetify-nuxt-module";
import colors from "vuetify/util/colors";

const primaryColor = "#1e13f8";
// const primaryColor = "#7600e4";
const secondaryColor = "#fc5ace";

export default {
  labComponents: [
    "VStepperVertical",
    "VStepperVerticalItem",
    "VStepperVerticalActions",
  ],

  theme: {
    defaultTheme: "light",

    themes: {
      light: {
        dark: false,
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          surface: "#e7e7e7",
          dark: colors.grey.darken4,
        },
      },
      dark: {
        dark: false,
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          dark: colors.grey.lighten5,
          background: "#080000",
        },
      },
    },
  },
} satisfies ExternalVuetifyOptions;
