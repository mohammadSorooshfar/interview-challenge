<script setup lang="ts">
import ProductCard from "~/components/ProductCard.vue";
import { useProducts } from "~/composables/useProducts";

const pageSize = 12;
const { normalizedProducts, loading, sentinelRef } = useProducts(pageSize);
</script>

<template>
  <div class="product-grid">
    <div v-for="p in normalizedProducts" :key="p.id">
      <ProductCard :product="p" />
    </div>

    <div v-if="loading" v-for="n in pageSize" :key="'skeleton-' + n">
      <ProductCard :loading="true" />
    </div>
  </div>

  <div ref="sentinelRef" style="height: 1px"></div>
</template>

<style lang="scss" scoped>
.product-grid {
  display: grid;
  gap: 1px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  background-color: #e0e0e0;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
}
</style>
