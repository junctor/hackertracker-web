import { onBeforeUnmount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

export function useRouteTextQuery(key = "q") {
  const route = useRoute();
  const router = useRouter();
  const query = ref(typeof route.query[key] === "string" ? route.query[key] : "");
  let updateTimer: number | undefined;

  watch(query, (value) => {
    if (updateTimer !== undefined) window.clearTimeout(updateTimer);
    const current = typeof route.query[key] === "string" ? route.query[key] : "";
    if (value === current) return;
    updateTimer = window.setTimeout(() => {
      updateTimer = undefined;
      const next = { ...route.query };
      if (value.trim()) next[key] = value;
      else delete next[key];
      void router.replace({ query: next });
    }, 200);
  });

  watch(
    () => route.query[key],
    (value) => {
      if (updateTimer !== undefined) {
        window.clearTimeout(updateTimer);
        updateTimer = undefined;
      }
      const next = typeof value === "string" ? value : "";
      if (query.value !== next) query.value = next;
    },
  );

  onBeforeUnmount(() => {
    if (updateTimer !== undefined) window.clearTimeout(updateTimer);
  });

  return query;
}
