<script setup lang="ts">
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
  <nuxt-page />
</template>
