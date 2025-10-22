// This script recursively copies the package's default templates
// from 'src/default_templates' into the build ('dist/default_templates')
// folder so the 'run' command can find them.

const fs = require("node:fs");
const path = require("node:path");

const srcDir = path.resolve(__dirname, "../src/default_templates");
const destDir = path.resolve(__dirname, "../dist/default_templates");

function copyRecursiveSync(src, dest) {
	const exists = fs.existsSync(src);
	if (!exists) {
		console.warn(`Source directory does not exist: ${src}`);
		return;
	}

	const stats = fs.statSync(src);
	const isDirectory = stats.isDirectory();

	if (isDirectory) {
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest, { recursive: true });
		}
		fs.readdirSync(src).forEach((childItemName) => {
			copyRecursiveSync(
				path.join(src, childItemName),
				path.join(dest, childItemName),
			);
		});
	} else {
		fs.copyFileSync(src, dest);
	}
}

if (!fs.existsSync(srcDir)) {
	console.log("No default_templates directory found in src. Skipping copy.");
} else {
	copyRecursiveSync(srcDir, destDir);
	console.log(
		"Recursively copied default template files to dist/default_templates.",
	);
}
