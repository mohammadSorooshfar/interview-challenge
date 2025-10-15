import { defineNuxtConfig } from "nuxt/config";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  build: {
    transpile: ["vuetify"],
  },
  vite: {
    ssr: { noExternal: ["vuetify"] },
    plugins: [vuetify({ autoImport: true })],
  },
  nitro: {
    preset: "node-server",
  },
  app: {
    head: {
      title: "Interview Challenge",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
});
