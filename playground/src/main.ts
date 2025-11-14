import PrimeVue from "primevue/config";
import { createApp } from "vue";
import App from "./App.vue";
import { primeVueConfig, registerPrimeVueComponents } from "./primevue-config";

// Import base Tailwind styles
import "./index.css";

const app = createApp(App);

app.use(PrimeVue, primeVueConfig);
registerPrimeVueComponents(app);

app.mount("#app");
