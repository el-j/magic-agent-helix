import PrimeVue from "primevue/config";
import { createApp } from "vue";
import App from "./App.vue";
import { primeVueConfig } from "./primevue-config";

// Import base Tailwind styles
import "./index.css";

const app = createApp(App);

app.use(PrimeVue, primeVueConfig);

app.mount("#app");
