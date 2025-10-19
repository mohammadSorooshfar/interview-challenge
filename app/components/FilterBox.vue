<script setup lang="ts">
import { useRoute, useRouter } from "#imports";
import { useDebounceFn } from "@vueuse/core";
import { computed, onMounted, ref, watch } from "vue";
import type { ICategories } from "~/types/categories";
import type {
  GetCategoriesResponse,
  GetMerchantsResponse,
} from "~/types/dto/categories";

defineProps<{ hideCategories?: boolean; mobile?: boolean }>();

const config = useRuntimeConfig();
const router = useRouter();
const route = useRoute();

const activeMerchantIds = ref<number[]>([]);
const merchantSearch = ref("");

const { data: categoriesResponse } = await useAsyncData(
  "categories-filter-data",
  async () => {
    try {
      const { data } = await $fetch<{ data: GetCategoriesResponse[] }>(
        `${config.public.apiBase}/categories`
      );
      return data;
    } catch (err) {
      console.warn("Error fetching categories (SSR):", err);
    }
  }
);

const { data: merchantsResponse } = await useAsyncData(
  "merchants-filter-data",
  async () => {
    try {
      const { data } = await $fetch<{ data: GetMerchantsResponse[] }>(
        `${config.public.apiBase}/merchants`
      );
      return data;
    } catch (err) {
      console.warn("Error fetching merchants (SSR):", err);
    }
  }
);

const categoryTree = computed<ICategories[]>(() => {
  const rawCategories = categoriesResponse.value;
  const categoryMap = new Map<number, ICategories>();

  rawCategories?.forEach((category) => {
    if (category.enabled)
      categoryMap.set(category.id, { ...category, children: [] });
  });

  categoryMap.forEach((category) => {
    if (category.parent && categoryMap.has(category.parent)) {
      categoryMap.get(category.parent)!.children.push(category);
    }
  });

  return Array.from(categoryMap.values()).filter(
    (category) => !category.parent
  );
});

const visibleMerchants = computed(() => {
  if (!merchantSearch.value) return merchantsResponse.value;
  return merchantsResponse.value?.filter((merchant) =>
    merchant.name.toLowerCase().includes(merchantSearch.value.toLowerCase())
  );
});

const initializeSelectedMerchants = () => {
  const queryParam = route.query.merchantIds;
  if (!queryParam) return;

  const ids = Array.isArray(queryParam)
    ? queryParam
    : String(queryParam).split(",");
  activeMerchantIds.value = ids.map(Number).filter((id) => !isNaN(id));
};
onMounted(initializeSelectedMerchants);

const applyMerchantFilter = useDebounceFn((ids: number[]) => {
  router.replace({
    query: {
      ...route.query,
      merchantIds: ids.length ? ids.join(",") : undefined,
    },
  });

  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}, 500);

watch(
  activeMerchantIds,
  (ids) => {
    applyMerchantFilter(ids);
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
          v-for="category in categoryTree"
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
      v-model="merchantSearch"
      :label="$t('product.searchStore')"
      append-inner-icon="mdi-magnify"
      rounded="lg"
      variant="outlined"
    />

    <div class="overflow-auto" style="max-height: 300px">
      <v-checkbox
        v-for="merchant in visibleMerchants"
        :key="merchant.id"
        v-model="activeMerchantIds"
        :value="merchant.id"
        :label="merchant.name"
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
