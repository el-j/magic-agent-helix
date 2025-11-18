import type {
  DetectionContext,
  DetectionPlugin,
  DetectionResult,
  InstructionTemplate,
} from '../plugin-system';

/**
 * Plugin for detecting Ruby projects.
 */
export class RubyPlugin implements DetectionPlugin {
  readonly name = 'ruby';
  readonly description = 'Detects Ruby projects via Gemfile, Rails, and framework identification';
  readonly version = '1.0.0';

  detect(context: DetectionContext): DetectionResult {
    // Check for Gemfile (Bundler)
    const hasGemfile = context.hasFile('Gemfile');
    const hasGemfileLock = context.hasFile('Gemfile.lock');
    
    // Check for .rb files
    const hasRbFiles = context.matchesPattern('**/*.rb');

    const detected = hasGemfile || hasRbFiles;

    if (!detected) {
      return { detected: false };
    }

    const metadata: Record<string, unknown> = {
      hasGemfile,
      hasGemfileLock,
      hasRbFiles,
    };

    // Detect Rails
    const isRails = context.hasFile('config/application.rb') && 
                    context.hasFile('config/routes.rb') &&
                    context.hasFile('Rakefile');
    
    if (isRails) {
      metadata.framework = 'rails';
      
      // Try to detect Rails version from Gemfile
      const gemfileContent = context.getTextFile('Gemfile');
      if (gemfileContent) {
        const railsMatch = gemfileContent.match(/gem\s+['"]rails['"]\s*,\s*['"]~>\s*([\d.]+)['"]/);
        if (railsMatch) {
          metadata.railsVersion = railsMatch[1];
        }
      }
    }
    
    // Detect Sinatra (lightweight web framework)
    const gemfileContent = context.getTextFile('Gemfile');
    if (gemfileContent?.includes('sinatra')) {
      metadata.framework = 'sinatra';
    }

    // Detect common gems
    if (gemfileContent) {
      const gems: string[] = [];
      if (gemfileContent.includes('puma')) gems.push('puma');
      if (gemfileContent.includes('sidekiq')) gems.push('sidekiq');
      if (gemfileContent.includes('rspec')) gems.push('rspec');
      if (gemfileContent.includes('rubocop')) gems.push('rubocop');
      
      if (gems.length > 0) {
        metadata.gems = gems;
      }
    }

    return {
      detected: true,
      tags: ['lang-ruby'],
      metadata,
    };
  }

  generateInstructions(
    _context: DetectionContext,
    metadata?: Record<string, unknown>,
  ): InstructionTemplate[] {
    const instructions: InstructionTemplate[] = [
      {
        template: 'ruby/lang-ruby.md',
        suffix: 'lang-ruby.md',
        targetFiles: ['**/*.rb'],
      },
    ];

    // Add Rails specific instructions
    if (metadata?.framework === 'rails') {
      instructions.push({
        template: 'ruby/framework-rails.md',
        suffix: 'framework-rails.md',
        targetFiles: ['**/*.rb'],
      });
    }

    // Add Sinatra specific instructions
    if (metadata?.framework === 'sinatra') {
      instructions.push({
        template: 'ruby/framework-sinatra.md',
        suffix: 'framework-sinatra.md',
        targetFiles: ['**/*.rb'],
      });
    }

    return instructions;
  }
}
