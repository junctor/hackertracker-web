import { createApp, nextTick } from "vue";

import App from "./App.vue";
import router from "./router";
import "./styles/base.css";
import "./styles/tokens.css";

router.afterEach(async (to, from) => {
  if (to.path === from.path) return;
  await nextTick();
  document.querySelector<HTMLElement>("#main")?.focus({ preventScroll: true });
});

createApp(App).use(router).mount("#app");

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js");
  });
}
