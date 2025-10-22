import { ref } from "vue";
import type { ProjectAnalysisData } from "magic-helix-core";
import { analyzeProjectTags, mergeConfigs } from "magic-helix-core";

/**
 * Composable for project analysis functionality
 */
export function useProjectAnalysis() {
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const currentFile = ref<string>("");
	const analysisResult = ref<{
		name: string;
		path: string;
		tags: string[];
	} | null>(null);

	/**
	 * Check if File System Access API is supported
	 */
	const isFileSystemAccessSupported = (): boolean => {
		return typeof window !== "undefined" && "showDirectoryPicker" in window;
	};

	/**
	 * Select and analyze a project folder
	 */
	const selectProject = async (): Promise<void> => {
		if (!isFileSystemAccessSupported()) {
			error.value =
				"File System Access API is not supported in this browser. Please use a modern browser like Chrome or Edge.";
			return;
		}

		isLoading.value = true;
		error.value = null;
		analysisResult.value = null;

		try {
			// @ts-ignore: File System Access API may not be in all TS libs
			const dirHandle = await window.showDirectoryPicker();

			// Scan the directory
			const { analysisData, projectName } = await scanDirectory(dirHandle);

			// Load & Merge Config
			const config = mergeConfigs({}); // Pass empty user config
			const { dependencyTagMap, configFileTagMap, fileGlobTagMap } = config;

			// Run Analysis
			const tags = analyzeProjectTags(
				analysisData,
				dependencyTagMap,
				configFileTagMap,
				fileGlobTagMap,
			);

			// Set results
			analysisResult.value = {
				name: projectName,
				path: dirHandle.name,
				tags: Array.from(tags),
			};
		} catch (err: any) {
			if (err.name === "AbortError") {
				error.value = "Folder selection was cancelled.";
			} else {
				error.value = `An error occurred: ${err.message}`;
				console.error(err);
			}
		} finally {
			isLoading.value = false;
			currentFile.value = "";
		}
	};

	/**
	 * Recursively scans a directory handle and builds the ProjectAnalysisData.
	 */
	const scanDirectory = async (
		dirHandle: any,
	): Promise<{ analysisData: ProjectAnalysisData; projectName: string }> => {
		let dependencies: Record<string, string> = {};
		const configFiles: string[] = [];
		const projectFiles: string[] = [];
		let projectName = dirHandle.name.replace(/@/g, "").replace(/\//g, "-");

		// Helper function to scan recursively
		const recursiveScan = async (handle: any, currentPath: string) => {
			for await (const entry of handle.values()) {
				const entryPath = currentPath
					? `${currentPath}/${entry.name}`
					: entry.name;
				currentFile.value = entryPath; // Update loading message

				if (entry.kind === "file") {
					projectFiles.push(entryPath);

					// Check for package.json
					if (entry.name === "package.json") {
						try {
							const file = await entry.getFile();
							const content = await file.text();
							const packageJson = JSON.parse(content);
							dependencies = {
								...dependencies,
								...packageJson.dependencies,
								...packageJson.devDependencies,
							};
						} catch (err) {
							console.warn("Failed to parse package.json:", err);
						}
					}

					// Check for config files
					const configFileNames = [
						"tsconfig.json",
						"vite.config.ts",
						"vite.config.js",
						"webpack.config.js",
						"next.config.js",
						"nuxt.config.ts",
					];
					if (configFileNames.includes(entry.name)) {
						configFiles.push(entry.name);
					}
				} else if (entry.kind === "directory") {
					// Don't scan node_modules, dist, .git, etc.
					if (
						![
							"node_modules",
							"dist",
							".git",
							".vscode",
							"build",
							"coverage",
						].includes(entry.name)
					) {
						await recursiveScan(entry, entryPath);
					}
				}
			}
		};

		await recursiveScan(dirHandle, "");

		return {
			analysisData: { dependencies, configFiles, projectFiles },
			projectName,
		};
	};

	return {
		// State
		isLoading,
		error,
		currentFile,
		analysisResult,

		// Methods
		isFileSystemAccessSupported,
		selectProject,
		scanDirectory,
	};
}
