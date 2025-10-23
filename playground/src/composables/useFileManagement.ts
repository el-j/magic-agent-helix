import { ref, computed } from "vue";
import type { TagTemplateMap } from "magic-helix-core";
import { BUILT_IN_CONFIG } from "magic-helix-core";
import { mockTemplates, generateFileHeader } from "./useMockData";
import {
	downloadFile,
	downloadMultipleFiles,
	downloadAsZip,
} from "../utils/fileHelpers";

/**
 * Composable for file management functionality
 */
export function useFileManagement() {
	const generatedFiles = ref<{ name: string; content: string }[]>([]);

	/**
	 * Check if files have been generated
	 */
	const hasFiles = computed(() => generatedFiles.value.length > 0);

	/**
	 * Generate instruction files based on detected tags
	 */
	const generateFiles = (projectName: string, tags: string[]): void => {
		const files: { name: string; content: string }[] = [];

		for (const tag of tags) {
			const templates = (BUILT_IN_CONFIG as any).tagTemplateMap[tag];
			if (templates) {
				for (const template of templates) {
					const content =
						mockTemplates[template.template as keyof typeof mockTemplates] ||
						`# Mock Content for ${template.template}`;
					const header = generateFileHeader(projectName, template.template);

					files.push({
						name: `${projectName}.${template.suffix}`,
						content: header + "\n" + content,
					});
				}
			}
		}

		generatedFiles.value = files;
	};

	/**
	 * Download a single file
	 */
	const downloadSingleFile = (file: {
		name: string;
		content: string;
	}): void => {
		downloadFile(file.name, file.content);
	};

	/**
	 * Download all files individually
	 */
	const downloadAllFiles = (): void => {
		downloadMultipleFiles(generatedFiles.value);
	};

	/**
	 * Download all files as ZIP
	 */
	const downloadAsZipArchive = (): void => {
		downloadAsZip(generatedFiles.value);
	};

	/**
	 * Reset a file to its original generated content
	 */
	const resetFileContent = (
		index: number,
		projectName: string,
		tags: string[],
	): void => {
		const file = generatedFiles.value[index];
		if (!file) return;

		// Find the tag this file belongs to
		const tag = tags.find((t) => file.name.includes(t));
		if (!tag) return;

		// Find the original template
		const templates = (BUILT_IN_CONFIG as any).tagTemplateMap[tag];
		if (!templates) return;

		const template = templates.find((t: any) => file.name.includes(t.suffix));
		if (!template) return;

		// Regenerate the content
		const content =
			mockTemplates[template.template as keyof typeof mockTemplates] ||
			`# Mock Content for ${template.template}`;
		const header = generateFileHeader(projectName, template.template);

		generatedFiles.value[index].content = header + "\n" + content;
	};

	/**
	 * Clear all generated files
	 */
	const clearFiles = (): void => {
		generatedFiles.value = [];
	};

	return {
		// State
		generatedFiles,
		hasFiles,

		// Methods
		generateFiles,
		downloadSingleFile,
		downloadAllFiles,
		downloadAsZipArchive,
		resetFileContent,
		clearFiles,
	};
}
