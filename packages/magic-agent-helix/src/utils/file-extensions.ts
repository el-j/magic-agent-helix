/**
 * Utilities for mapping tags to appropriate file extensions
 */

export interface FileExtensionMapping {
	extensions: string[];
	description: string;
}

/**
 * Maps tags to their associated file extensions
 */
export const TAG_FILE_EXTENSIONS: Record<string, FileExtensionMapping> = {
	// Frameworks
	"framework-vue": {
		extensions: ["vue"],
		description: "Vue components",
	},
	"framework-react": {
		extensions: ["tsx", "jsx", "ts", "js"],
		description: "React components",
	},
	"framework-angular": {
		extensions: ["ts"],
		description: "Angular components",
	},
	"framework-nestjs": {
		extensions: ["ts"],
		description: "NestJS controllers and services",
	},

	// Languages
	"lang-typescript": {
		extensions: ["ts", "tsx"],
		description: "TypeScript files",
	},
	"lang-javascript": {
		extensions: ["js", "jsx"],
		description: "JavaScript files",
	},
	"lang-go": {
		extensions: ["go"],
		description: "Go files",
	},
	"lang-python": {
		extensions: ["py"],
		description: "Python files",
	},

	// Styling
	"style-tailwind": {
		extensions: ["ts", "tsx", "js", "jsx", "vue"],
		description: "Files using Tailwind CSS",
	},
	"style-primevue": {
		extensions: ["vue"],
		description: "Vue files with PrimeVue",
	},
	"style-mui": {
		extensions: ["tsx", "jsx"],
		description: "React files with Material UI",
	},

	// Testing
	"test-vitest": {
		extensions: ["test.ts", "test.tsx", "spec.ts", "spec.tsx"],
		description: "Vitest test files",
	},
	"test-jest": {
		extensions: [
			"test.ts",
			"test.tsx",
			"test.js",
			"test.jsx",
			"spec.ts",
			"spec.tsx",
			"spec.js",
			"spec.jsx",
		],
		description: "Jest test files",
	},
	"test-cypress": {
		extensions: ["cy.ts", "cy.js"],
		description: "Cypress test files",
	},
	"test-playwright": {
		extensions: ["spec.ts", "spec.js"],
		description: "Playwright test files",
	},

	// State management
	"state-rxjs": {
		extensions: ["ts", "tsx"],
		description: "Files using RxJS",
	},
	"state-pinia": {
		extensions: ["ts", "vue"],
		description: "Vue files with Pinia",
	},
	"state-redux": {
		extensions: ["ts", "tsx", "js", "jsx"],
		description: "Files using Redux",
	},
	"state-zustand": {
		extensions: ["ts", "tsx", "js", "jsx"],
		description: "Files using Zustand",
	},
};

/**
 * Get file extensions for a given tag
 */
export function getFileExtensionsForTag(tag: string): string[] {
	return TAG_FILE_EXTENSIONS[tag]?.extensions || [];
}

/**
 * Build a precise glob pattern based on project path and tags
 */
export function buildPreciseGlobPattern(
	projectPath: string,
	tags: Set<string>,
	excludePattern?: string,
): string {
	const allExtensions = new Set<string>();

	// Collect all extensions from all tags
	for (const tag of tags) {
		const exts = getFileExtensionsForTag(tag);
		for (const ext of exts) {
			allExtensions.add(ext);
		}
	}

	// Fallback to common extensions if no tags matched
	if (allExtensions.size === 0) {
		return `${projectPath}/src/**/*.{ts,js,vue,tsx,jsx}`;
	}

	// Build pattern
	const extList = Array.from(allExtensions).join(",");
	let pattern = `${projectPath}/src/**/*.{${extList}}`;

	// Add exclude pattern if provided
	if (excludePattern) {
		// Convert exclude pattern to glob negation
		const excludePatterns = excludePattern.split(",").map((p) => p.trim());
		for (const exclude of excludePatterns) {
			// Handle directory exclusions
			if (exclude.endsWith("/**")) {
				pattern += ` !(${projectPath}/src/${exclude})`;
			} else if (exclude.includes("*")) {
				pattern += ` !(${projectPath}/src/${exclude})`;
			} else {
				// Exact file match
				pattern += ` !(${projectPath}/src/${exclude})`;
			}
		}
	}

	return pattern;
}

/**
 * Get a human-readable description of what file types apply
 */
export function getApplyToDescription(tags: Set<string>): string {
	const descriptions: string[] = [];

	for (const tag of tags) {
		const mapping = TAG_FILE_EXTENSIONS[tag];
		if (mapping) {
			descriptions.push(mapping.description);
		}
	}

	return descriptions.length > 0 ? descriptions.join(", ") : "Source files";
}
