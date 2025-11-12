import type {
  DetectionContext,
  DetectionPlugin,
  DetectionResult,
  InstructionTemplate,
} from '../plugin-system';

/**
 * Plugin for detecting Python projects.
 */
export class PythonPlugin implements DetectionPlugin {
  readonly name = 'python';
  readonly description =
    'Detects Python projects and provides Python-specific instructions';
  readonly version = '1.0.0';

  detect(context: DetectionContext): DetectionResult {
    // Check for common Python project files
    const hasPyprojectToml = context.hasFile('pyproject.toml');
    const hasRequirementsTxt = context.hasFile('requirements.txt');
    const hasSetupPy = context.hasFile('setup.py');
    const hasPipfile = context.hasFile('Pipfile');

    // Check for .py files
    const hasPyFiles = context.matchesPattern('**/*.py');

    const detected =
      hasPyprojectToml ||
      hasRequirementsTxt ||
      hasSetupPy ||
      hasPipfile ||
      hasPyFiles;

    if (!detected) {
      return { detected: false };
    }

    const metadata: Record<string, unknown> = {
      hasPyprojectToml,
      hasRequirementsTxt,
      hasSetupPy,
      hasPipfile,
      hasPyFiles,
    };

    // Detect package manager
    if (hasPyprojectToml) {
      const pyprojectContent = context.getTextFile('pyproject.toml');
      if (pyprojectContent) {
        if (pyprojectContent.includes('[tool.poetry]')) {
          metadata.packageManager = 'poetry';
        } else if (pyprojectContent.includes('[build-system]')) {
          metadata.packageManager = 'pip';
        }
      }
    } else if (hasPipfile) {
      metadata.packageManager = 'pipenv';
    } else if (hasRequirementsTxt) {
      metadata.packageManager = 'pip';
    }

    // Detect common frameworks
    const frameworks: string[] = [];
    const requirementsContent = context.getTextFile('requirements.txt');
    if (requirementsContent) {
      if (requirementsContent.includes('django')) frameworks.push('django');
      if (requirementsContent.includes('flask')) frameworks.push('flask');
      if (requirementsContent.includes('fastapi')) frameworks.push('fastapi');
    }

    if (frameworks.length > 0) {
      metadata.frameworks = frameworks;
    }

    return {
      detected: true,
      tags: ['lang-python'],
      metadata,
    };
  }

  generateInstructions(
    _context: DetectionContext,
    _metadata?: Record<string, unknown>,
  ): InstructionTemplate[] {
    return [
      {
        template: 'python/lang-python.md',
        suffix: 'lang-python.md',
        targetFiles: ['**/*.py'],
      },
    ];
  }
}
