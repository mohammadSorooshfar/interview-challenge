import { defineNuxtConfig } from "nuxt/config";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  build: {
    transpile: ["vuetify"],
  },

  runtimeConfig: {
    public: {
      apiBase: "https://interview-api.azkivam.com/api/v1",
    },
  },

  vite: {
    ssr: { noExternal: ["vuetify"] },
    plugins: [vuetify({ autoImport: true })],
  },

  nitro: {
    preset: "node-server",
  },

  css: ["@/assets/styles/main.scss"],

  app: {
    head: {
      title: "Interview Challenge",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
});
