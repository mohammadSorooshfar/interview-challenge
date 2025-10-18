<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { useRoute } from "#imports";
import { useDisplay } from "vuetify";
import { useI18n } from "vue-i18n";

const display = useDisplay();
const isDrawerOpen = ref(false);
const route = useRoute();

const isCategoryPage = computed(() => !!route.params.categoryId);

const { t } = useI18n();
const pageTitle = computed(() => {
  if (isCategoryPage.value) return `${route.params.slug}`.replaceAll("-", " ");
  return t("product.products");
});

watch(
  () => route.fullPath,
  () => {
    isDrawerOpen.value = false;
  }
);

useHead({ title: pageTitle });

const isClient = ref(false);
onMounted(() => {
  isClient.value = true;
});

const mdAndDown = computed(() => {
  return isClient.value ? display.mdAndDown.value : false;
});
</script>

<template>
  <v-container class="pa-16">
    <h1 class="mb-8">{{ pageTitle }}</h1>

    <div class="mb-4" v-if="isClient && mdAndDown">
      <v-btn icon="mdi-filter-variant" @click="isDrawerOpen = true" />
      <span class="ms-2 text-subtitle-1">{{ $t("product.filters") }}</span>
    </div>

    <v-row>
      <v-col cols="12" md="4" v-show="isClient && !mdAndDown">
        <FilterBox :hide-categories="isCategoryPage" />
      </v-col>

      <v-col cols="12" md="8">
        <ProductList />
      </v-col>
    </v-row>

    <client-only>
      <v-navigation-drawer
        v-if="isClient && mdAndDown"
        v-model="isDrawerOpen"
        width="320"
      >
        <FilterBox :hide-categories="isCategoryPage" :mobile="true" />
      </v-navigation-drawer>
    </client-only>
  </v-container>
</template>
