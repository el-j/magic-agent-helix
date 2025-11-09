import Aura from "@primeuix/themes/aura";
import Accordion from "primevue/accordion";
import AccordionContent from "primevue/accordioncontent";
import AccordionHeader from "primevue/accordionheader";
import AccordionPanel from "primevue/accordionpanel";
import Button from "primevue/button";
import Card from "primevue/card";
import Chip from "primevue/chip";
import Divider from "primevue/divider";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Panel from "primevue/panel";
import ProgressSpinner from "primevue/progressspinner";
import ScrollPanel from "primevue/scrollpanel";
import Tag from "primevue/tag";

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
	app.component("InputText", InputText);
	app.component("ProgressSpinner", ProgressSpinner);
	app.component("Tag", Tag);
	app.component("Message", Message);
	app.component("Accordion", Accordion);
	app.component("AccordionPanel", AccordionPanel);
	app.component("AccordionHeader", AccordionHeader);
	app.component("AccordionContent", AccordionContent);
	app.component("ScrollPanel", ScrollPanel);
	app.component("Panel", Panel);
}
