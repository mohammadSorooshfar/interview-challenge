import "@/assets/styles/main.scss";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import { useI18n } from "vue-i18n";
import { i18n } from "./i18n";
import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    locale: {
      adapter: createVueI18nAdapter({ i18n, useI18n }),
    },
    theme: {
      defaultTheme: "light",
      themes: {
        light: {
          dark: false,
          colors: {
            primary: "#f7f8fa",
            secondary: "#e0e0e0",
          },
        },
      },
    },
  });
  nuxtApp.vueApp.use(vuetify);
});
