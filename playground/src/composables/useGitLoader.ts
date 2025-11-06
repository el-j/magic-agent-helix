import type { ProjectAnalysisData } from "magic-helix-core";
import { analyzeProjectTags, mergeConfigs } from "magic-helix-core";
import { ref } from "vue";

/**
 * Composable for loading projects from Git URLs
 */
export function useGitLoader() {
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const currentFile = ref<string>("");
	const analysisResult = ref<{
		name: string;
		path: string;
		tags: string[];
	} | null>(null);

	/**
	 * Load a project from a GitHub/GitLab URL
	 */
	const loadFromGitUrl = async (gitUrl: string): Promise<void> => {
		isLoading.value = true;
		error.value = null;
		analysisResult.value = null;
		currentFile.value = "";

		try {
			// Parse the Git URL
			const parsedUrl = parseGitUrl(gitUrl);
			if (!parsedUrl) {
				throw new Error(
					"Invalid Git URL. Please provide a GitHub or GitLab URL.",
				);
			}

			currentFile.value = "Fetching repository information...";

			// Fetch repository structure via GitHub/GitLab API
			const analysisData = await fetchRepoData(parsedUrl);

			// Load & Merge Config
			const config = mergeConfigs({});
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
				name: parsedUrl.repo.replace(/[/@]/g, "-"),
				path: parsedUrl.fullPath,
				tags: Array.from(tags),
			};
		} catch (err) {
			error.value = (err as Error).message || "Failed to load repository";
			console.error(err);
		} finally {
			isLoading.value = false;
			currentFile.value = "";
		}
	};

	/**
	 * Parse a Git URL into components
	 */
	function parseGitUrl(url: string): {
		provider: "github" | "gitlab";
		owner: string;
		repo: string;
		branch: string;
		fullPath: string;
	} | null {
		// GitHub URL patterns:
		// https://github.com/owner/repo
		// https://github.com/owner/repo/tree/branch
		const githubMatch = url.match(
			/github\.com\/([^/]+)\/([^/]+?)(?:\/tree\/([^/]+)|\/|$)/,
		);
		if (githubMatch) {
			return {
				provider: "github",
				owner: githubMatch[1],
				repo: githubMatch[2].replace(/\.git$/, ""),
				branch: githubMatch[3] || "main",
				fullPath: `github.com/${githubMatch[1]}/${githubMatch[2]}`,
			};
		}

		// GitLab URL patterns:
		// https://gitlab.com/owner/repo
		// https://gitlab.com/owner/repo/-/tree/branch
		const gitlabMatch = url.match(
			/gitlab\.com\/([^/]+)\/([^/]+?)(?:\/-\/tree\/([^/]+)|\/|$)/,
		);
		if (gitlabMatch) {
			return {
				provider: "gitlab",
				owner: gitlabMatch[1],
				repo: gitlabMatch[2].replace(/\.git$/, ""),
				branch: gitlabMatch[3] || "main",
				fullPath: `gitlab.com/${gitlabMatch[1]}/${gitlabMatch[2]}`,
			};
		}

		return null;
	}

	/**
	 * Fetch repository data from Git provider API
	 */
	async function fetchRepoData(parsedUrl: {
		provider: "github" | "gitlab";
		owner: string;
		repo: string;
		branch: string;
	}): Promise<ProjectAnalysisData> {
		const dependencies: Record<string, string> = {};
		const configFiles: string[] = [];
		const projectFiles: string[] = [];

		if (parsedUrl.provider === "github") {
			// Use GitHub API
			const baseUrl = `https://api.github.com/repos/${parsedUrl.owner}/${parsedUrl.repo}`;

			currentFile.value = "Fetching repository tree...";

			// Get tree (file structure)
			const treeResponse = await fetch(
				`${baseUrl}/git/trees/${parsedUrl.branch}?recursive=1`,
			);

			if (!treeResponse.ok) {
				if (treeResponse.status === 404) {
					throw new Error(
						`Repository not found or branch '${parsedUrl.branch}' doesn't exist. Try 'main' or 'master'.`,
					);
				}
				throw new Error(
					`Failed to fetch repository: ${treeResponse.statusText}`,
				);
			}

			const treeData = await treeResponse.json();

			// Collect file paths
			for (const item of treeData.tree) {
				if (item.type === "blob") {
					// It's a file
					projectFiles.push(item.path);

					// Check for specific files we need to fetch
					if (item.path === "package.json") {
						currentFile.value = "Reading package.json...";
						try {
							const fileResponse = await fetch(
								`${baseUrl}/contents/${item.path}?ref=${parsedUrl.branch}`,
							);
							const fileData = await fileResponse.json();
							const content = atob(fileData.content); // Base64 decode
							const packageJson = JSON.parse(content);
							Object.assign(dependencies, {
								...packageJson.dependencies,
								...packageJson.devDependencies,
							});
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
						"tailwind.config.js",
						"tailwind.config.ts",
					];
					const fileName = item.path.split("/").pop();
					if (fileName && configFileNames.includes(fileName)) {
						configFiles.push(fileName);
					}
				}
			}
		} else if (parsedUrl.provider === "gitlab") {
			// Use GitLab API
			const baseUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(
				`${parsedUrl.owner}/${parsedUrl.repo}`,
			)}`;

			currentFile.value = "Fetching repository tree...";

			// Get tree
			const treeResponse = await fetch(
				`${baseUrl}/repository/tree?recursive=true&ref=${parsedUrl.branch}&per_page=100`,
			);

			if (!treeResponse.ok) {
				throw new Error(
					`Failed to fetch repository: ${treeResponse.statusText}`,
				);
			}

			const treeData = await treeResponse.json();

			// Collect file paths
			for (const item of treeData) {
				if (item.type === "blob") {
					projectFiles.push(item.path);

					// Check for package.json
					if (item.path === "package.json") {
						currentFile.value = "Reading package.json...";
						try {
							const fileResponse = await fetch(
								`${baseUrl}/repository/files/${encodeURIComponent(
									item.path,
								)}/raw?ref=${parsedUrl.branch}`,
							);
							const content = await fileResponse.text();
							const packageJson = JSON.parse(content);
							Object.assign(dependencies, {
								...packageJson.dependencies,
								...packageJson.devDependencies,
							});
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
						"tailwind.config.js",
						"tailwind.config.ts",
					];
					const fileName = item.path.split("/").pop();
					if (fileName && configFileNames.includes(fileName)) {
						configFiles.push(fileName);
					}
				}
			}
		}

		return { dependencies, configFiles, projectFiles };
	}

	return {
		// State
		isLoading,
		error,
		currentFile,
		analysisResult,

		// Methods
		loadFromGitUrl,
	};
}
