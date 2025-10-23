/**
 * File download utilities for the web playground
 */

/**
 * Download a single file as a blob
 */
export function downloadFile(filename: string, content: string): void {
	const blob = new Blob([content], { type: "text/markdown" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * Download multiple files with staggered timing to avoid browser blocking
 */
export function downloadMultipleFiles(
	files: { name: string; content: string }[],
): void {
	files.forEach((file, index) => {
		setTimeout(() => downloadFile(file.name, file.content), index * 100);
	});
}

/**
 * Create a simple ZIP-like download (for now just downloads individual files)
 * In a real implementation, you'd use a library like JSZip
 */
export function downloadAsZip(
	files: { name: string; content: string }[],
): void {
	// For now, just download individual files
	// TODO: Implement proper ZIP creation with JSZip
	downloadMultipleFiles(files);
}
