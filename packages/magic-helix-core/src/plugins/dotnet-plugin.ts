import type {
  DetectionContext,
  DetectionPlugin,
  DetectionResult,
  InstructionTemplate,
} from '../plugin-system';

/**
 * Plugin for detecting C#/.NET projects.
 */
export class DotNetPlugin implements DetectionPlugin {
  readonly name = 'dotnet';
  readonly description =
    'Detects C# and .NET projects via .csproj, .sln, and framework identification';
  readonly version = '1.0.0';

  detect(context: DetectionContext): DetectionResult {
    // Check for .csproj files (project files)
    const hasCsproj = context.matchesPattern('**/*.csproj');

    // Check for .sln files (solution files)
    const hasSln = context.matchesPattern('**/*.sln');

    // Check for .cs files
    const hasCsFiles = context.matchesPattern('**/*.cs');

    const detected = hasCsproj || hasSln || hasCsFiles;

    if (!detected) {
      return { detected: false };
    }

    const metadata: Record<string, unknown> = {
      hasCsproj,
      hasSln,
      hasCsFiles,
    };

    // Try to parse .csproj for framework detection
    const csprojFiles = context.files.filter((f) => f.endsWith('.csproj'));
    if (csprojFiles.length > 0) {
      const csprojContent = context.getTextFile(csprojFiles[0]);
      if (csprojContent) {
        // Detect target framework
        const tfmMatch = csprojContent.match(
          /<TargetFramework>([^<]+)<\/TargetFramework>/,
        );
        if (tfmMatch) {
          metadata.targetFramework = tfmMatch[1];
        }

        // Detect ASP.NET Core
        if (csprojContent.includes('Microsoft.AspNetCore')) {
          metadata.framework = 'aspnetcore';
        }

        // Detect Blazor
        if (
          csprojContent.includes('Microsoft.AspNetCore.Components.WebAssembly')
        ) {
          metadata.framework = 'blazor-wasm';
        } else if (
          csprojContent.includes('Microsoft.AspNetCore.Components.Server')
        ) {
          metadata.framework = 'blazor-server';
        }

        // Detect .NET MAUI
        if (csprojContent.includes('Microsoft.Maui')) {
          metadata.framework = 'maui';
        }
      }
    }

    return {
      detected: true,
      tags: ['lang-csharp'],
      metadata,
    };
  }

  generateInstructions(
    _context: DetectionContext,
    metadata?: Record<string, unknown>,
  ): InstructionTemplate[] {
    const instructions: InstructionTemplate[] = [
      {
        template: 'dotnet/lang-csharp.md',
        suffix: 'lang-csharp.md',
        targetFiles: ['**/*.cs'],
      },
    ];

    // Add ASP.NET Core specific instructions
    if (metadata?.framework === 'aspnetcore') {
      instructions.push({
        template: 'dotnet/framework-aspnetcore.md',
        suffix: 'framework-aspnetcore.md',
        targetFiles: ['**/*.cs'],
      });
    }

    // Add Blazor specific instructions
    if (
      metadata?.framework === 'blazor-wasm' ||
      metadata?.framework === 'blazor-server'
    ) {
      instructions.push({
        template: 'dotnet/framework-blazor.md',
        suffix: 'framework-blazor.md',
        targetFiles: ['**/*.cs', '**/*.razor'],
      });
    }

    return instructions;
  }
}
