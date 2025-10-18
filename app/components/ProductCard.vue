<script setup lang="ts">
import { ref } from "vue";
import type { PostProductsResponse } from "~/types/dto/products";

interface ProductCardProps
  extends Omit<PostProductsResponse, "minPrice" | "maxPrice"> {
  minPrice: string;
  maxPrice: string;
}

defineProps<{
  product?: ProductCardProps;
  loading?: boolean;
}>();

const imageLoaded = ref(false);

function onImageLoad() {
  imageLoaded.value = true;
}
</script>

<template>
  <div>
    <v-skeleton-loader
      v-if="loading"
      type="image, heading, subtitle, subtitle"
      class="w-100"
      style="min-height: 500px"
    />

    <v-card
      v-else
      class="d-flex flex-column pa-3 elevation-0 rounded-0"
      role="article"
    >
      <div class="img-wrap w-100 position-relative">
        <v-sheet class="h-100" color="secondary" />

        <v-img
          v-if="product?.imageUrl"
          :src="product.imageUrl"
          :alt="product?.name"
          class="real-image left-0 top-0 h-100 w-100 position-absolute"
          cover
          loading="lazy"
          @load="onImageLoad"
          :style="{ opacity: imageLoaded ? 1 : 0 }"
        />
      </div>

      <v-card-title class="text-truncate mt-2">
        {{ product?.name }}
      </v-card-title>

      <v-card-subtitle class="text-subtitle-2">
        {{ $t("product.startPrice") }}
      </v-card-subtitle>

      <v-card-text class="text-h6 font-weight-bold pt-0">
        {{ product?.minPrice }}

        <span class="text-subtitle-2" style="vertical-align: super">
          {{ $t("product.toman") }}
        </span>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.img-wrap {
  aspect-ratio: 1 / 1;
}

.real-image {
  object-fit: cover;
  transition: opacity 240ms ease-in-out;
}
</style>
