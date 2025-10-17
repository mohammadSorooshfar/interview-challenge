<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "#imports";
import { useDisplay } from "vuetify";

const display = useDisplay();
const drawer = ref(false);
const route = useRoute();

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
    <h1 class="mb-8">{{ `${$route.params.slug}`.replaceAll("-", " ") }}</h1>

    <div class="mb-4" v-if="mdAndDown">
      <v-btn icon="mdi-filter-variant" @click="drawer = true" />

      <span class="ms-2 text-subtitle-1">{{ $t("product.filters") }}</span>
    </div>

    <v-row>
      <v-col md="4" v-if="!mdAndDown">
        <FilterBox hideCategories />
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
      <FilterBox hideCategories :mobile="true" />
    </v-navigation-drawer>
  </v-container>
</template>
