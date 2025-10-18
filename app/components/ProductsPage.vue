<script setup lang="ts">
import { ref, watch, computed } from "vue"; // Add computed
import { useRoute } from "#imports";
import { useDisplay } from "vuetify";
import { useI18n } from "vue-i18n";

const display = useDisplay();
const drawer = ref(false);
const route = useRoute();

const isCategoryPage = computed(() => !!route.params.categoryId);

const { t } = useI18n();
const pageTitle = computed(() => {
  if (isCategoryPage.value) {
    return `${route.params.slug}`.replaceAll("-", " ");
  }
  return t("product.products");
});

watch(
  () => route.fullPath,
  () => {
    drawer.value = false;
  }
);

const mdAndDown = computed(() => display.mdAndDown.value);
</script>

<template>
  <v-container class="pa-16">
    <h1 class="mb-8">{{ pageTitle }}</h1>

    <div class="mb-4" v-if="mdAndDown">
      <v-btn icon="mdi-filter-variant" @click="drawer = true" />

      <span class="ms-2 text-subtitle-1">{{ $t("product.filters") }}</span>
    </div>

    <v-row>
      <v-col cols="12" md="4" v-if="!mdAndDown">
        <FilterBox :hide-categories="isCategoryPage" />
      </v-col>

      <v-col cols="12" md="8">
        <ProductList />
      </v-col>
    </v-row>

    <v-navigation-drawer
      v-model="drawer"
      temporary
      width="320"
      location="start"
      scrim
      :hide-overlay="false"
    >
      <FilterBox :hide-categories="isCategoryPage" :mobile="true" />
    </v-navigation-drawer>
  </v-container>
</template>
