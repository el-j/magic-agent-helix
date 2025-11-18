import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadUserConfig, mergeConfigs } from '@magic-helix/core';
import ora from 'ora';
import pc from 'picocolors';

/**
 * The 'validate' command.
 * Checks instruction files for common issues.
 */
export async function validate() {
  console.log(pc.cyan('🔍 Validating instruction files...\n'));

  const spinner = ora('Loading configuration...').start();

  // Load config
  const userConfig = loadUserConfig();
  const config = mergeConfigs(userConfig);
  spinner.succeed('Configuration loaded.');

  const targetDir = path.resolve(
    process.cwd(),
    config.outputDirectory as string,
  );

  // Check if directory exists
  if (!fs.existsSync(targetDir)) {
    spinner.fail(
      pc.red(
        `❌ Output directory ${config.outputDirectory} does not exist. Run 'magic-helix run' first.`,
      ),
    );
    return;
  }

  // Find all .md files
  const files = fs.readdirSync(targetDir).filter((f) => f.endsWith('.md'));

  if (files.length === 0) {
    console.log(
      pc.yellow("No instruction files found. Run 'magic-helix run' first."),
    );
    return;
  }

  console.log(pc.gray(`Checking ${files.length} instruction file(s)...\n`));

  let validCount = 0;
  let errorCount = 0;
  const issues: string[] = [];

  for (const file of files) {
    const filePath = path.join(targetDir, file);
    let hasIssues = false;

    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check 1: Has frontmatter
      if (!content.startsWith('---')) {
        issues.push(`${file}: Missing frontmatter delimiter`);
        hasIssues = true;
      }

      // Check 2: Has applyTo field
      if (!content.includes('applyTo:')) {
        issues.push(`${file}: Missing 'applyTo' field in frontmatter`);
        hasIssues = true;
      }

      // Check 3: Frontmatter is properly closed
      const lines = content.split('\n');
      let frontmatterClosed = false;
      let lineCount = 0;
      for (let i = 1; i < lines.length; i++) {
        lineCount++;
        if (lines[i].trim() === '---') {
          frontmatterClosed = true;
          break;
        }
        if (lineCount > 50) break; // Safety limit
      }
      if (!frontmatterClosed) {
        issues.push(`${file}: Frontmatter not properly closed with '---'`);
        hasIssues = true;
      }

      // Check 4: Has content after frontmatter
      const contentAfterFrontmatter = content
        .split('---')
        .slice(2)
        .join('---')
        .trim();
      if (contentAfterFrontmatter.length < 10) {
        issues.push(
          `${file}: File appears to have no content after frontmatter`,
        );
        hasIssues = true;
      }

      // Check 5: applyTo pattern looks valid
      const applyToMatch = content.match(/applyTo:\s*"([^"]+)"/);
      if (applyToMatch) {
        const pattern = applyToMatch[1];
        if (!pattern.includes('/**/*') && !pattern.includes('*')) {
          issues.push(
            `${file}: applyTo pattern '${pattern}' may not be a valid glob`,
          );
          hasIssues = true;
        }
      }

      if (hasIssues) {
        errorCount++;
      } else {
        validCount++;
      }
    } catch (e) {
      issues.push(`${file}: Error reading file - ${(e as Error).message}`);
      errorCount++;
    }
  }

  // Display results
  console.log(pc.bold('Validation Results:\n'));
  console.log(pc.green(`✅ Valid files: ${validCount}`));
  console.log(pc.red(`❌ Files with issues: ${errorCount}`));

  if (issues.length > 0) {
    console.log(pc.yellow('\nIssues found:\n'));
    for (const issue of issues) {
      console.log(pc.yellow(`  - ${issue}`));
    }
    console.log(
      pc.gray("\nRun 'magic-helix refresh' to regenerate files with issues."),
    );
  } else {
    console.log(pc.green('\n✨ All instruction files are valid!'));
  }
}
