import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

export function useRouteTextQuery(key = "q") {
  const route = useRoute();
  const router = useRouter();
  const query = ref(typeof route.query[key] === "string" ? route.query[key] : "");

  watch(query, (value) => {
    const next = { ...route.query };
    if (value.trim()) next[key] = value;
    else delete next[key];
    void router.replace({ query: next });
  });

  watch(
    () => route.query[key],
    (value) => {
      const next = typeof value === "string" ? value : "";
      if (query.value !== next) query.value = next;
    },
  );

  return query;
}
