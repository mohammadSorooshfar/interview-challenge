import { createI18n } from "vue-i18n";
import { en, fa } from "vuetify/locale";

const renameKeysToFileName = (obj: Record<string, Record<string, string>>) => {
  return Object.keys(obj).reduce((acc, key) => {
    const fileName = key.split("/").pop()?.replace(".ts", "") || key;

    if (obj[key]) acc[fileName] = obj[key];

    return acc;
  }, {} as Record<string, Record<string, string>>);
};

const enMessages: Record<string, Record<string, string>> = import.meta.glob(
  "@/locales/en/*.ts",
  {
    eager: true,
    import: "default",
  }
);

const faMessages: Record<string, Record<string, string>> = import.meta.glob(
  "@/locales/fa/*.ts",
  {
    eager: true,
    import: "default",
  }
);

const messages = {
  en: {
    ...renameKeysToFileName(enMessages),
    $vuetify: en,
  },
  fa: {
    ...renameKeysToFileName(faMessages),
    $vuetify: fa,
  },
};

export const i18n = createI18n({
  legacy: false,
  locale: "fa",
  fallbackLocale: "en",
  messages,
});

export default defineNuxtPlugin((app) => {
  app.vueApp.use(i18n);
});
