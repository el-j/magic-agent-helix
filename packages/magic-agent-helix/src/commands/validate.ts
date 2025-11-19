import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  createTelemetry,
  formatValidationReport,
  loadUserConfig,
  mergeConfigs,
  validateInstructions,
} from '@magic-helix/core';
import ora from 'ora';
import pc from 'picocolors';

/**
 * The 'validate' command.
 * Checks instruction files for quality based on awesome-ai-system-prompts best practices.
 */
export async function validate() {
  console.log(
    pc.cyan('🔍 Validating instruction files with quality scoring...\n'),
  );

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

  // Telemetry (opt-in via env vars)
  const telemetry = createTelemetry({});

  let passCount = 0;
  let failCount = 0;
  const results: Array<{ file: string; score: number; grade: string }> = [];

  for (const file of files) {
    const filePath = path.join(targetDir, file);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Run quality validation
      const quality = validateInstructions(content);
      const grade = getQualityGrade(quality.overallScore);

      results.push({ file, score: quality.overallScore, grade });

      if (quality.overallScore >= 70) {
        passCount++;
      } else {
        failCount++;
      }

      // Display individual file results
      const scoreColor =
        quality.overallScore >= 90
          ? pc.green
          : quality.overallScore >= 70
            ? pc.blue
            : pc.yellow;

      console.log(
        scoreColor(`${grade} ${quality.overallScore}/100`) +
          pc.gray(` - ${file}`),
      );

      if (quality.missingElements.length > 0) {
        console.log(
          pc.red(`     Missing: ${quality.missingElements.join(', ')}`),
        );
      }

      if (quality.recommendations.length > 0 && quality.overallScore < 90) {
        console.log(pc.gray(`     Tip: ${quality.recommendations[0]}`));
      }

      // Track per-file validation result
      telemetry.track({
        type: 'instruction_validation',
        file,
        score: quality.overallScore,
        structureScore: quality.structureScore,
        clarityScore: quality.clarityScore,
        completenessScore: quality.completenessScore,
        missingCount: quality.missingElements.length,
      });
    } catch (e) {
      failCount++;
      console.log(pc.red(`ERROR - ${file}: ${(e as Error).message}`));
    }
  }

  // Display summary
  console.log(pc.bold('\n=== Validation Summary ===\n'));
  console.log(pc.green(`✅ Passed (≥70): ${passCount}`));
  console.log(pc.red(`❌ Failed (<70): ${failCount}`));

  const avgScore =
    results.reduce((sum, r) => sum + r.score, 0) / results.length;
  console.log(pc.cyan(`📊 Average Score: ${Math.round(avgScore)}/100`));

  telemetry.track({
    type: 'summary',
    files: results.length,
    pass: passCount,
    fail: failCount,
    averageScore: Math.round(avgScore),
  });

  if (failCount === 0 && avgScore >= 80) {
    console.log(pc.green('\n✨ All instruction files meet quality standards!'));
  } else if (failCount > 0) {
    console.log(
      pc.yellow(
        `\n⚠️  ${failCount} file(s) need improvement. Run with --verbose for details.`,
      ),
    );
  }
}

function getQualityGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
