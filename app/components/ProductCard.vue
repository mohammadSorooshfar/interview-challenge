<script setup lang="ts">
import type { PostProductsResponse } from "../types/dto/products";

interface ProductCardProps
  extends Omit<PostProductsResponse, "minPrice" | "maxPrice"> {
  minPrice: string;
  maxPrice: string;
}

defineProps<{
  product?: ProductCardProps;
  loading?: boolean;
}>();
</script>

<template>
  <v-skeleton-loader
    v-if="loading"
    class="mx-auto w-100"
    style="height: 436px"
    type="image, heading, subtitle, subtitle"
  ></v-skeleton-loader>

  <v-card v-else class="d-flex flex-column ga-2 rounded-0" elevation="0">
    <v-img
      :src="product?.imageUrl"
      :alt="product?.name"
      width="300"
      height="300"
      class="mx-auto"
      loading="lazy"
    />

    <v-card-title class="text-truncate">
      {{ product?.name }}
    </v-card-title>

    <v-card-subtitle class="text-subtitle-2">
      {{ $t("product.startPrice") }}
    </v-card-subtitle>

    <v-card-text class="text-h6 font-weight-bold pt-0">
      {{ product?.minPrice }}

      <span class="text-subtitle-2" style="vertical-align: super">{{
        $t("product.toman")
      }}</span>
    </v-card-text>
  </v-card>
</template>
