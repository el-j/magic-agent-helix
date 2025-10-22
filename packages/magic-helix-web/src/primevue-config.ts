import Aura from "@primeuix/themes/aura";
import Button from "primevue/button";
import Card from "primevue/card";
import Chip from "primevue/chip";
import Divider from "primevue/divider";
import ProgressSpinner from "primevue/progressspinner";
import Tag from "primevue/tag";
import Message from "primevue/message";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import ScrollPanel from "primevue/scrollpanel";
import Panel from "primevue/panel";

// This is the "styled" mode config with Aura theme
export const primeVueConfig = {
	theme: {
		preset: Aura,
		options: {
			darkModeSelector: "system",
		},
	},
};

// This function is not used, but shows how you would
// register components manually if you didn't auto-import
export function registerPrimeVueComponents(app: any) {
	app.component("Button", Button);
	app.component("Card", Card);
	app.component("Chip", Chip);
	app.component("Divider", Divider);
	app.component("ProgressSpinner", ProgressSpinner);
	app.component("Tag", Tag);
	app.component("Message", Message);
	app.component("Accordion", Accordion);
	app.component("AccordionTab", AccordionTab);
	app.component("ScrollPanel", ScrollPanel);
	app.component("Panel", Panel);
}
