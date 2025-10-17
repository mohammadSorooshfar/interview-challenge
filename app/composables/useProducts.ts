import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute } from "#imports";
import type {
  PostProductsResponse,
  PostProductsRequest,
} from "~/types/dto/products";

export function useProducts(pageSize: number) {
  const route = useRoute();
  const products = ref<PostProductsResponse[]>([]);
  const totalItems = ref<number | null>(null);
  const currentPage = ref(1);
  const loading = ref(false);
  const reachedEnd = ref(false);
  const config = useRuntimeConfig();

  const normalizeUrl = (url: string) =>
    url ? url.replace(/^https::?/, "http:").replace(/^http::?/, "http:") : "";

  const normalizedProducts = computed(() =>
    products.value.map((p) => ({
      ...p,
      imageUrl: normalizeUrl(p.imageUrl),
      minPrice: new Intl.NumberFormat("fa-IR").format(p.minPrice),
      maxPrice: new Intl.NumberFormat("fa-IR").format(p.maxPrice),
    }))
  );

  const currentFilters = computed<PostProductsRequest>(() => {
    const q = route.query;
    const merchantIds = q.merchantIds
      ? (Array.isArray(q.merchantIds)
          ? q.merchantIds
          : String(q.merchantIds).split(",")
        ).map((n) => Number(n))
      : [];
    return { merchantIds };
  });

  async function fetchPage(page: number) {
    if (loading.value || reachedEnd.value) return { ok: false, empty: false };
    loading.value = true;

    const hasCategory = !!route.params.categoryId;
    const url = hasCategory
      ? `${config.public.apiBase}/products/${route.params.categoryId}`
      : `${config.public.apiBase}/products`;

    try {
      const res = await $fetch<{
        data: PostProductsResponse[];
        totalItems: number;
      }>(url, {
        method: "POST",
        query: { size: pageSize, page },
        body: currentFilters.value,
      });

      const incoming = res.data ?? [];
      totalItems.value = res.totalItems ?? totalItems.value;

      if (incoming.length === 0 && page === 0) {
        reachedEnd.value = true;
        products.value = [];
        currentPage.value = 0;
        return { ok: true, empty: true };
      }

      if (incoming.length < pageSize) reachedEnd.value = true;

      products.value.push(...incoming);

      currentPage.value = page;
      return { ok: true, empty: incoming.length === 0 };
    } catch (err) {
      console.warn("fetchPage error", err);
      return { ok: false, empty: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  async function resetAndFetch() {
    products.value = [];
    totalItems.value = null;
    currentPage.value = 1;
    reachedEnd.value = false;
    await fetchPage(currentPage.value);
  }

  onMounted(() => {
    resetAndFetch();
  });

  watch(
    () => [route.query, route.params.categoryId],
    () => {
      resetAndFetch();
    },
    { deep: true }
  );

  async function onLoad(args: {
    done: (status: "ok" | "empty" | "error") => void;
  }) {
    try {
      if (loading.value || reachedEnd.value) {
        return args.done(reachedEnd.value ? "empty" : "ok");
      }
      const nextPage = currentPage.value + 1;
      const result = await fetchPage(nextPage);

      if (result.ok) {
        if (result.empty || reachedEnd.value) {
          args.done("empty");
        } else {
          args.done("ok");
        }
      } else {
        args.done("error");
      }
    } catch (err) {
      console.error("onLoad error", err);
      args.done("error");
    }
  }

  return {
    normalizedProducts,
    loading,
    onLoad,
  };
}
