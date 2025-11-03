import { describe, it, expect, beforeEach } from "vitest";
import { analyzeWithPlugins, registerBuiltInPlugins } from "./plugin-analyzer";
import { pluginRegistry } from "./plugin-system";
import type { ProjectAnalysisData } from "./analysis";
import { GolangPlugin, PythonPlugin, DockerPlugin } from "./plugins";

describe("Plugin Analyzer", () => {
	beforeEach(() => {
		// Clear registry before each test
		pluginRegistry.clear();
	});

	it("should analyze Go project", async () => {
		// Register Go plugin
		pluginRegistry.register(new GolangPlugin());

		const analysisData: ProjectAnalysisData = {
			dependencies: {},
			configFiles: ["go.mod"],
			projectFiles: ["main.go", "go.mod", "go.sum"]
		};

		const result = await analyzeWithPlugins(analysisData);

		expect(result.tags.has("lang-go")).toBe(true);
		expect(result.instructions.length).toBeGreaterThan(0);
		expect(result.instructions[0].suffix).toBe("lang-go.md");
	});

	it("should analyze Python project", async () => {
		pluginRegistry.register(new PythonPlugin());

		const analysisData: ProjectAnalysisData = {
			dependencies: {},
			configFiles: ["pyproject.toml"],
			projectFiles: ["main.py", "pyproject.toml", "src/app.py"]
		};

		const result = await analyzeWithPlugins(analysisData);

		expect(result.tags.has("lang-python")).toBe(true);
		expect(result.instructions.length).toBeGreaterThan(0);
	});

	it("should analyze Docker project", async () => {
		pluginRegistry.register(new DockerPlugin());

		const analysisData: ProjectAnalysisData = {
			dependencies: {},
			configFiles: [],
			projectFiles: ["Dockerfile", "docker-compose.yml", "src/main.js"]
		};

		const result = await analyzeWithPlugins(analysisData);

		expect(result.tags.has("devops-docker")).toBe(true);
		expect(result.instructions.length).toBeGreaterThan(0);
	});

	it("should analyze multi-language project", async () => {
		pluginRegistry.register(new GolangPlugin());
		pluginRegistry.register(new DockerPlugin());

		const analysisData: ProjectAnalysisData = {
			dependencies: {},
			configFiles: ["go.mod"],
			projectFiles: ["main.go", "go.mod", "Dockerfile"]
		};

		const result = await analyzeWithPlugins(analysisData);

		expect(result.tags.has("lang-go")).toBe(true);
		expect(result.tags.has("devops-docker")).toBe(true);
		expect(result.instructions.length).toBeGreaterThan(1);
	});

	it("should handle projects with no matches", async () => {
		pluginRegistry.register(new GolangPlugin());

		const analysisData: ProjectAnalysisData = {
			dependencies: {},
			configFiles: [],
			projectFiles: ["index.html", "style.css"]
		};

		const result = await analyzeWithPlugins(analysisData);

		expect(result.tags.size).toBe(0);
		expect(result.instructions.length).toBe(0);
	});

	it("should collect metadata from plugins", async () => {
		pluginRegistry.register(new GolangPlugin());

		const analysisData: ProjectAnalysisData = {
			dependencies: {},
			configFiles: ["go.mod"],
			projectFiles: ["main.go", "go.mod"]
		};

		const fileReader = (path: string): string | null => {
			if (path === "go.mod") {
				return "module github.com/user/project\n\ngo 1.21";
			}
			return null;
		};

		const result = await analyzeWithPlugins(analysisData, fileReader);

		expect(result.metadata.has("golang")).toBe(true);
		const goMetadata = result.metadata.get("golang");
		expect(goMetadata?.moduleName).toBe("github.com/user/project");
		expect(goMetadata?.goVersion).toBe("1.21");
	});

	it("should handle plugin errors gracefully", async () => {
		// Register a plugin that throws an error
		const errorPlugin = {
			name: "error-plugin",
			description: "Test error plugin",
			version: "1.0.0",
			detect: () => {
				throw new Error("Test error");
			},
			generateInstructions: () => []
		};

		pluginRegistry.register(errorPlugin);
		pluginRegistry.register(new GolangPlugin());

		const analysisData: ProjectAnalysisData = {
			dependencies: {},
			configFiles: ["go.mod"],
			projectFiles: ["main.go", "go.mod"]
		};

		// Should not throw, should continue with other plugins
		const result = await analyzeWithPlugins(analysisData);

		expect(result.tags.has("lang-go")).toBe(true);
	});

	it("should support glob pattern matching", async () => {
		pluginRegistry.register(new PythonPlugin());

		const analysisData: ProjectAnalysisData = {
			dependencies: {},
			configFiles: ["requirements.txt"], // Add config file to ensure detection
			projectFiles: [
				"requirements.txt",
				"src/app.py",
				"src/utils/helper.py",
				"tests/test_app.py"
			]
		};

		const result = await analyzeWithPlugins(analysisData);

		expect(result.tags.has("lang-python")).toBe(true);
	});
});
