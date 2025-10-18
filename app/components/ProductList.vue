<script setup lang="ts">
import ProductCard from "~/components/ProductCard.vue";
import { useProducts } from "~/composables/useProducts";

const pageSize = 12;
const { normalizedProducts, onLoad, loading } = useProducts(pageSize);
</script>

<template>
  <client-only placeholder-tag="div">
    <v-infinite-scroll
      class="rounded-xl bg-secondary border border-secondary overflow-hidden"
      @load="onLoad"
      :margin="400"
      side="end"
    >
      <div class="product-grid">
        <ProductCard v-for="p in normalizedProducts" :key="p.id" :product="p" />

        <ProductCard
          v-if="loading"
          v-for="n in pageSize"
          :key="'skeleton-' + n"
          :loading="true"
        />
      </div>

      <template #loading></template>

      <template #empty>
        <div
          v-if="normalizedProducts.length === 0"
          class="bg-white d-flex justify-center align-center text-h5"
          style="min-height: 420px"
        >
          {{ $t("product.noItemFound") }}
        </div>
      </template>
    </v-infinite-scroll>
  </client-only>
</template>

<style lang="scss">
.product-grid {
  display: grid;
  gap: 1px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.v-infinite-scroll__side {
  padding: 0;
}
</style>
