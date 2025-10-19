import { ref, computed, watch } from "vue";
import { useRoute, useAsyncData, useRuntimeConfig } from "#imports";
import type {
  PostProductsResponse,
  PostProductsRequest,
} from "~/types/dto/products";

export function useProducts(pageSize: number) {
  const route = useRoute();
  const config = useRuntimeConfig();

  const products = ref<PostProductsResponse[]>([]);
  const totalItemsCount = ref<number>();
  const currentPage = ref(1);
  const loading = ref(false);
  const reachedEnd = ref(false);

  const normalizeUrl = (url?: string) =>
    url?.replace(/^https?:?/, "http:") || "";

  const normalizedProducts = computed(() =>
    products.value.map((p) => ({
      ...p,
      imageUrl: normalizeUrl(p.imageUrl),
      minPrice: new Intl.NumberFormat("fa-IR").format(p.minPrice),
      maxPrice: new Intl.NumberFormat("fa-IR").format(p.maxPrice),
    }))
  );

  const currentFilters = computed<PostProductsRequest>(() => {
    const ids = String(route.query.merchantIds || "")
      .split(",")
      .filter(Boolean)
      .map(Number);
    return { merchantIds: ids };
  });

  const endpoint = computed(() =>
    route.params.categoryId
      ? `${config.public.apiBase}/products/${route.params.categoryId}`
      : `${config.public.apiBase}/products`
  );

  const { data: initialData, refresh } = useAsyncData(
    `products-${route.params.categoryId || "all"}`,
    () =>
      $fetch<{ data: PostProductsResponse[]; totalItems: number }>(
        endpoint.value,
        {
          method: "POST",
          query: { size: pageSize, page: 1 },
          body: currentFilters.value,
        }
      ),
    {
      immediate: true,
      server: true,
    }
  );

  watch(
    initialData,
    (res) => {
      if (!res?.data) return;
      products.value = res.data;
      totalItemsCount.value = res.totalItems;
      reachedEnd.value = res.data.length < pageSize;
      currentPage.value = 1;
    },
    { immediate: true }
  );

  if (import.meta.client) {
    watch(
      () => [route.params.categoryId, route.query],
      async () => {
        reachedEnd.value = false;
        currentPage.value = 1;
        await refresh();
      },
      { deep: true }
    );
  }

  async function fetchPage(page: number) {
    if (loading.value || reachedEnd.value) return { ok: false };
    loading.value = true;
    try {
      const { data = [] } = await $fetch<{
        data: PostProductsResponse[];
      }>(endpoint.value, {
        method: "POST",
        query: { size: pageSize, page },
        body: currentFilters.value,
      });
      products.value.push(...data);

      if (products.value.length === totalItemsCount.value)
        reachedEnd.value = true;

      currentPage.value = page;
      return { ok: true };
    } catch (err) {
      console.warn("fetchPage error", err);
      return { ok: false };
    } finally {
      loading.value = false;
    }
  }

  async function onLoad({
    done,
  }: {
    done: (status: "ok" | "empty" | "error") => void;
  }) {
    if (loading.value || reachedEnd.value)
      return done(reachedEnd.value ? "empty" : "ok");

    const nextPage = currentPage.value + 1;
    const res = await fetchPage(nextPage);
    done(res.ok ? "ok" : "error");
  }

  return { normalizedProducts, loading, onLoad };
}
