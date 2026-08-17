import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";
import "./styles/base.css";
import "./styles/tokens.css";
import "./styles/people.css";
import "./styles/content.css";
import "./styles/static.css";

createApp(App).use(router).mount("#app");
