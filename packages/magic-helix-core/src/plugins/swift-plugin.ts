import type {
  DetectionContext,
  DetectionPlugin,
  DetectionResult,
  InstructionTemplate,
} from '../plugin-system';

/**
 * Plugin for detecting Swift projects.
 */
export class SwiftPlugin implements DetectionPlugin {
  readonly name = 'swift';
  readonly description =
    'Detects Swift projects via Package.swift, Xcode projects, and framework identification';
  readonly version = '1.0.0';

  detect(context: DetectionContext): DetectionResult {
    // Check for Package.swift (Swift Package Manager)
    const hasPackageSwift = context.hasFile('Package.swift');

    // Check for .swift files
    const hasSwiftFiles = context.matchesPattern('**/*.swift');

    // Check for Xcode project
    const hasXcodeProject =
      context.matchesPattern('**/*.xcodeproj') ||
      context.matchesPattern('**/*.xcworkspace');

    const detected = hasPackageSwift || hasSwiftFiles || hasXcodeProject;

    if (!detected) {
      return { detected: false };
    }

    const metadata: Record<string, unknown> = {
      hasPackageSwift,
      hasSwiftFiles,
      hasXcodeProject,
    };

    // Detect Vapor framework (server-side Swift)
    if (hasPackageSwift) {
      const packageContent = context.getTextFile('Package.swift');
      if (packageContent) {
        if (packageContent.includes('vapor')) {
          metadata.framework = 'vapor';
        }

        // Extract Swift version
        const swiftVersionMatch = packageContent.match(
          /swift-tools-version:\s*([\d.]+)/,
        );
        if (swiftVersionMatch) {
          metadata.swiftToolsVersion = swiftVersionMatch[1];
        }

        // Extract package name
        const packageNameMatch = packageContent.match(/name:\s*"([^"]+)"/);
        if (packageNameMatch) {
          metadata.packageName = packageNameMatch[1];
        }
      }
    }

    // Detect platform target
    const platforms: string[] = [];
    if (hasXcodeProject) {
      platforms.push('iOS/macOS');
    }
    if (hasPackageSwift) {
      platforms.push('Linux/Server');
    }

    if (platforms.length > 0) {
      metadata.platforms = platforms;
    }

    return {
      detected: true,
      tags: ['lang-swift'],
      metadata,
    };
  }

  generateInstructions(
    _context: DetectionContext,
    metadata?: Record<string, unknown>,
  ): InstructionTemplate[] {
    const instructions: InstructionTemplate[] = [
      {
        template: 'swift/lang-swift.md',
        suffix: 'lang-swift.md',
        targetFiles: ['**/*.swift'],
      },
    ];

    // Add Vapor specific instructions
    if (metadata?.framework === 'vapor') {
      instructions.push({
        template: 'swift/framework-vapor.md',
        suffix: 'framework-vapor.md',
        targetFiles: ['**/*.swift'],
      });
    }

    return instructions;
  }
}
