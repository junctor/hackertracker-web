<script setup lang="ts">
import { onMounted } from "vue";

import PageState from "../components/PageState.vue";

onMounted(() => {
  const path = `${import.meta.env.BASE_URL}apps/index.html`;
  window.location.replace(new URL(path, window.location.origin).href);
});
</script>

<template>
  <main id="main">
    <PageState kind="loading" message="Opening Hacker Tracker apps…" />
  </main>
</template>
