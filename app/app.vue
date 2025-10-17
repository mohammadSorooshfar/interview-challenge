<script setup lang="ts">
import { useHead } from "nuxt/app";
import { useLocale } from "vuetify";

const locale = useLocale();

useHead({
  htmlAttrs: {
    dir: locale.rtl ? "rtl" : "ltr",
    lang: locale.current.value,
  },
});
</script>

<template>
  <v-app>
    <nuxt-layout>
      <nuxt-page />
    </nuxt-layout>
  </v-app>
</template>
