<script setup lang="ts">
import { PackageX, ShieldCheck } from "@lucide/vue";
import { computed, ref, shallowRef, watch, watchEffect } from "vue";

import type { ConferenceProduct } from "../types/hackertracker";

import MarkdownContent from "../components/MarkdownContent.vue";
import PageHeading from "../components/PageHeading.vue";
import PageState from "../components/PageState.vue";
import SearchField from "../components/SearchField.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { getProducts } from "../firebase/data";
import { friendlyLoadError } from "../lib/errors";
import { safeWebUrl } from "../lib/urls";

const { conference } = useConferenceContext();
const products = shallowRef<ConferenceProduct[]>([]);
const loading = ref(true);
const error = ref("");
const query = ref("");
const brokenImages = ref(new Set<number>());
let request = 0;

const filtered = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase();
  return products.value.filter(
    (product) =>
      !needle || `${product.title} ${product.description}`.toLocaleLowerCase().includes(needle),
  );
});

const imageUrl = (product: ConferenceProduct) => safeWebUrl(product.media[0]?.url);
const markBroken = (id: number) => (brokenImages.value = new Set([...brokenImages.value, id]));
const inStock = (product: ConferenceProduct) =>
  product.variants.some((variant) => !["OUT", "SOLD_OUT"].includes(variant.stockStatus));
const formatMoney = (cents: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
const priceLabel = (product: ConferenceProduct) => {
  const minimum = product.priceMin;
  const maximum = product.priceMax;
  if (minimum === null && maximum === null) return "Price unavailable";
  if (minimum !== null && maximum !== null && minimum !== maximum)
    return `${formatMoney(minimum)}–${formatMoney(maximum)}`;
  return formatMoney(minimum ?? maximum ?? 0);
};

watch(
  conference,
  async (current) => {
    const currentRequest = ++request;
    if (!current) {
      products.value = [];
      loading.value = false;
      return;
    }
    loading.value = true;
    error.value = "";
    try {
      const loaded = await getProducts(current.code);
      if (currentRequest === request) products.value = loaded;
    } catch (reason) {
      if (currentRequest === request) error.value = friendlyLoadError(reason, "merchandise");
    } finally {
      if (currentRequest === request) loading.value = false;
    }
  },
  { immediate: true },
);

watchEffect(() => {
  if (conference.value) document.title = `Merch · ${conference.value.name} | Hacker Tracker`;
});
</script>

<template>
  <section v-if="conference" class="container page-content merch-page">
    <PageHeading
      title="Merch"
      intro="Browse official conference merchandise and current availability."
      :count="loading ? undefined : `${filtered.length.toLocaleString()} products`"
    />
    <p v-if="conference.merch_tax_statement" class="merch-notice">
      {{ conference.merch_tax_statement }}
    </p>
    <SearchField
      v-if="products.length > 8"
      v-model="query"
      class="merch-search"
      label="Search merchandise"
      placeholder="Search merchandise…"
    />
    <PageState
      v-if="loading"
      kind="loading"
      heading-level="h2"
      message="Getting the latest merchandise…"
    />
    <PageState
      v-else-if="error"
      kind="error"
      heading-level="h2"
      title="Merch unavailable"
      :message="error"
      retry
    />
    <PageState
      v-else-if="!filtered.length"
      kind="empty"
      heading-level="h2"
      :title="query ? 'No merch found' : 'No merch available'"
      :message="query ? `No products match “${query}”.` : 'No products are listed right now.'"
      :icon="PackageX"
    />
    <ul v-else class="product-grid">
      <li v-for="product in filtered" :key="product.id">
        <article class="product-card">
          <div class="product-image">
            <img
              v-if="imageUrl(product) && !brokenImages.has(product.id)"
              :src="imageUrl(product)!"
              :alt="product.media[0]?.name || product.title"
              loading="lazy"
              decoding="async"
              @error="markBroken(product.id)"
            />
            <PackageX v-else aria-hidden="true" />
          </div>
          <div class="product-copy">
            <div class="product-title-row">
              <h2>{{ product.title }}</h2>
              <strong>{{ priceLabel(product) }}</strong>
            </div>
            <MarkdownContent v-if="product.description" :content="product.description" />
            <p v-if="product.eligibilityRestricted" class="restriction">
              <ShieldCheck aria-hidden="true" />
              {{ product.eligibilityRestrictionText || "Eligibility restrictions apply." }}
            </p>
            <ul v-if="product.variants.length" class="variant-list" aria-label="Options">
              <li
                v-for="variant in product.variants"
                :key="variant.variantId"
                :class="{ unavailable: ['OUT', 'SOLD_OUT'].includes(variant.stockStatus) }"
              >
                {{ variant.title }}
              </li>
            </ul>
            <p class="stock" :class="{ 'stock--out': !inStock(product) }">
              {{ inStock(product) ? "Available at the merch store" : "Currently sold out" }}
            </p>
          </div>
        </article>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.merch-search {
  max-width: 34rem;
  margin-top: var(--space-6);
}
.merch-notice {
  margin-top: var(--space-4);
  border-left: 3px solid var(--brand-cyan);
  padding-left: var(--space-3);
  color: var(--text-muted);
  font-size: 0.875rem;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 21rem), 1fr));
  list-style: none;
  gap: var(--space-5);
  margin-top: var(--space-7);
}
.product-card {
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-3);
  background: var(--surface-muted);
}
.product-image {
  display: grid;
  min-height: 15rem;
  place-items: center;
  background: var(--surface-elevated);
}
.product-image img {
  width: 100%;
  height: 15rem;
  object-fit: contain;
}
.product-image svg {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--text-subtle);
}
.product-copy {
  padding: var(--space-5);
}
.product-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}
.product-title-row h2 {
  font-size: 1.15rem;
  line-height: 1.3;
}
.product-title-row strong {
  color: var(--accent-success);
  white-space: nowrap;
}
.product-copy :deep(.markdown) {
  margin-top: var(--space-3);
  font-size: 0.9rem;
}
.restriction {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  margin-top: var(--space-3);
  color: var(--warning);
  font-size: 0.82rem;
}
.restriction svg {
  width: 1rem;
  flex: 0 0 auto;
}
.variant-list {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  gap: var(--space-2);
  margin-top: var(--space-4);
}
.variant-list li {
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  padding: 0.2rem 0.55rem;
  color: var(--text-secondary);
  font-size: 0.75rem;
}
.variant-list .unavailable {
  color: var(--text-subtle);
  text-decoration: line-through;
}
.stock {
  margin-top: var(--space-4);
  color: var(--accent-success);
  font-size: 0.78rem;
  font-weight: 650;
}
.stock--out {
  color: var(--critical-soft);
}
</style>
