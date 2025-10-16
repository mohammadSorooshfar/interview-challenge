import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
} from "vue";
import type {
  PostProductsRequest,
  PostProductsResponse,
} from "~/types/dto/products";

export function useProducts(pageSize: number) {
  const products = ref<PostProductsResponse[]>([]);
  const totalItems = ref<number | null>(null);
  const currentPage = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);
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

  async function fetchPage(page: number, body?: PostProductsRequest) {
    if (loading.value || reachedEnd.value) return;
    loading.value = true;
    error.value = null;

    try {
      const res = await $fetch<{
        data: PostProductsResponse[];
        totalItems: number;
      }>(`${config.public.apiBase}/products`, {
        method: "POST",
        query: { size: pageSize, page },
        body,
      });

      const incoming = res.data ?? [];
      totalItems.value = res.totalItems ?? totalItems.value;
      if (incoming.length < pageSize) reachedEnd.value = true;

      products.value.push(...incoming);
      currentPage.value = page;
    } catch (err: any) {
      if (err?.name !== "AbortError") error.value = String(err);
    } finally {
      loading.value = false;
    }
  }

  async function loadNextPage(body?: PostProductsRequest) {
    if (!loading.value && !reachedEnd.value) {
      await fetchPage(currentPage.value + 1, body);
    }
  }

  const sentinelRef = ref<HTMLElement | null>(null);
  let io: IntersectionObserver | null = null;

  function setupObserver(body?: PostProductsRequest) {
    if (!window.IntersectionObserver) return;
    io = new IntersectionObserver(
      async ([entry]) => {
        if (entry?.isIntersecting && !loading.value && !reachedEnd.value) {
          await loadNextPage(body);
        }
      },
      { root: null, rootMargin: "400px", threshold: 0.01 }
    );
    if (sentinelRef.value) io.observe(sentinelRef.value);
  }

  async function ensureScrollable(body?: PostProductsRequest) {
    await nextTick();
    const scrollable =
      document.documentElement.scrollHeight > window.innerHeight + 50;

    if (!scrollable && !loading.value && !reachedEnd.value) {
      await loadNextPage(body);
    }
  }

  onMounted(() => {
    setupObserver();

    watch(
      () => products.value.length,
      async () => {
        await ensureScrollable();
      },
      { immediate: true }
    );
  });

  onBeforeUnmount(() => {
    if (io && sentinelRef.value) io.unobserve(sentinelRef.value);
  });

  return {
    normalizedProducts,
    loading,
    sentinelRef,
  };
}
