<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "#imports";
import { useDebounceFn } from "@vueuse/core";
import type { ICategories } from "~/types/categories";
import type {
  GetCategoriesResponse,
  GetMerchantsResponse,
} from "~/types/dto/categories";

defineProps<{ hideCategories?: boolean; mobile?: boolean }>();

const config = useRuntimeConfig();
const router = useRouter();
const route = useRoute();

const selectedMerchants = ref<number[]>([]);
const merchantSearchQuery = ref("");

const { data: categoriesData } = await useAsyncData(
  "product-filters-categories",
  async () => {
    try {
      const res = await $fetch<{ data: GetCategoriesResponse[] }>(
        `${config.public.apiBase}/categories`
      );

      return res.data;
    } catch (err) {
      console.warn("Error fetching categories (SSR):", err);
    }
  }
);

const { data: merchantsData } = await useAsyncData(
  "product-filters-merchants",
  async () => {
    try {
      const res = await $fetch<{ data: GetMerchantsResponse[] }>(
        `${config.public.apiBase}/merchants`
      );

      return res.data;
    } catch (err) {
      console.warn("Error fetching merchants (SSR):", err);
    }
  }
);

const categories = computed<ICategories[]>(() => {
  const raw = categoriesData.value;
  const map = new Map<number, ICategories>();
  raw?.forEach((c) => {
    if (c.enabled) map.set(c.id, { ...c, children: [] });
  });

  map.forEach((cat) => {
    if (cat.parent && map.has(cat.parent)) {
      map.get(cat.parent)!.children.push(cat);
    }
  });

  return Array.from(map.values()).filter((cat) => !cat.parent);
});

const filteredMerchants = computed(() => {
  if (!merchantSearchQuery.value) return merchantsData.value;
  return merchantsData.value?.filter((m) =>
    m.name.toLowerCase().includes(merchantSearchQuery.value.toLowerCase())
  );
});

const setInitialMerchantsFromRoute = () => {
  const q = route.query.merchantIds;
  if (!q) return;
  const ids = Array.isArray(q) ? q : String(q).split(",");
  selectedMerchants.value = ids.map(Number).filter((id) => !isNaN(id));
};
onMounted(setInitialMerchantsFromRoute);

const updateQuery = useDebounceFn((val: number[]) => {
  router.replace({
    query: {
      ...route.query,
      merchantIds: val.length ? val.join(",") : undefined,
    },
  });

  if (import.meta.client) window.scrollTo({ top: 0, behavior: "smooth" });
}, 500);

watch(
  selectedMerchants,
  (val) => {
    updateQuery(val);
  },
  { deep: true }
);
</script>

<template>
  <div
    :class="[
      'filter-box pa-8 ',
      !mobile ? 'position-sticky rounded-xl bg-white border' : '',
    ]"
    :style="!mobile ? 'top: 1rem' : ''"
  >
    <h2 class="mb-6">{{ $t("product.filters") }}</h2>

    <template v-if="!hideCategories">
      <h3 class="mb-6">{{ $t("product.category") }}</h3>
      <v-expansion-panels multiple>
        <v-expansion-panel
          v-for="category in categories"
          :key="category.id"
          elevation="0"
          class="border-0"
        >
          <v-expansion-panel-title>
            <span class="text-h6">{{ category.name }}</span>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="d-flex flex-column ga-4 ps-4">
              <NuxtLink
                v-for="child in category.children"
                :key="child.id"
                :to="`/products/${child.id}/${child.slug}`"
                class="text-decoration-none text-black text-subtitle-1"
              >
                {{ child.name }}
              </NuxtLink>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-divider class="my-6" />
    </template>

    <h3 class="my-6">{{ $t("product.stores") }}</h3>

    <v-text-field
      v-model="merchantSearchQuery"
      :label="$t('product.searchStore')"
      append-inner-icon="mdi-magnify"
      rounded="lg"
      variant="outlined"
    />

    <div class="overflow-auto" style="max-height: 300px">
      <v-checkbox
        v-for="m in filteredMerchants"
        :key="m.id"
        v-model="selectedMerchants"
        :value="m.id"
        :label="m.name"
        class="w-full"
      />
    </div>
  </div>
</template>

<style lang="scss">
.filter-box .v-expansion-panel:not(:first-child)::after {
  border: none;
}
.filter-box .v-selection-control__wrapper {
  flex-direction: row-reverse;
}
</style>
