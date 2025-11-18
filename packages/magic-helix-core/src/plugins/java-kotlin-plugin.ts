import type {
  DetectionContext,
  DetectionPlugin,
  DetectionResult,
  InstructionTemplate,
} from '../plugin-system';

/**
 * Plugin for detecting Java/Kotlin projects.
 */
export class JavaKotlinPlugin implements DetectionPlugin {
  readonly name = 'java-kotlin';
  readonly description = 'Detects Java and Kotlin projects via Maven, Gradle, and framework identification';
  readonly version = '1.0.0';

  detect(context: DetectionContext): DetectionResult {
    // Check for Maven (pom.xml)
    const hasMaven = context.hasFile('pom.xml');
    
    // Check for Gradle (build.gradle, build.gradle.kts)
    const hasGradle = context.hasFile('build.gradle') || context.hasFile('build.gradle.kts');
    
    // Check for .java and .kt files
    const hasJavaFiles = context.matchesPattern('**/*.java');
    const hasKotlinFiles = context.matchesPattern('**/*.kt');

    const detected = hasMaven || hasGradle || hasJavaFiles || hasKotlinFiles;

    if (!detected) {
      return { detected: false };
    }

    const metadata: Record<string, unknown> = {
      hasMaven,
      hasGradle,
      hasJavaFiles,
      hasKotlinFiles,
    };

    // Determine primary language
    if (hasKotlinFiles && !hasJavaFiles) {
      metadata.language = 'kotlin';
    } else if (hasJavaFiles && !hasKotlinFiles) {
      metadata.language = 'java';
    } else if (hasJavaFiles && hasKotlinFiles) {
      metadata.language = 'java-kotlin';
    }

    // Determine build tool
    if (hasMaven && hasGradle) {
      metadata.buildTool = 'maven-gradle';
    } else if (hasMaven) {
      metadata.buildTool = 'maven';
      
      // Parse pom.xml for additional metadata
      const pomContent = context.getTextFile('pom.xml');
      if (pomContent) {
        // Extract project groupId and artifactId (not from parent or dependencies)
        const projectGroupMatch = pomContent.match(/<parent>[\s\S]*?<\/parent>[\s\S]*?<groupId>([^<]+)<\/groupId>/);
        const projectArtifactMatch = pomContent.match(/<parent>[\s\S]*?<\/parent>[\s\S]*?<artifactId>([^<]+)<\/artifactId>/);
        
        if (projectGroupMatch && projectArtifactMatch) {
          metadata.artifact = `${projectGroupMatch[1]}:${projectArtifactMatch[1]}`;
        }
        
        // Detect Spring Boot
        if (pomContent.includes('spring-boot-starter')) {
          metadata.framework = 'spring-boot';
        }
      }
    } else if (hasGradle) {
      metadata.buildTool = 'gradle';
      
      // Check both .gradle and .gradle.kts
      const gradleContent = context.getTextFile('build.gradle') || context.getTextFile('build.gradle.kts');
      if (gradleContent) {
        // Detect Spring Boot
        if (gradleContent.includes('org.springframework.boot')) {
          metadata.framework = 'spring-boot';
        }
        
        // Detect Kotlin usage in Gradle
        if (gradleContent.includes('kotlin')) {
          metadata.hasKotlinPlugin = true;
        }
      }
    }

    // Detect common frameworks
    const frameworks: string[] = [];
    if (metadata.framework === 'spring-boot') {
      frameworks.push('spring-boot');
    }
    
    // Check for Micronaut
    const hasMicronaut = context.hasFile('micronaut-cli.yml') || 
                         (context.getTextFile('pom.xml')?.includes('micronaut') ?? false) ||
                         (context.getTextFile('build.gradle')?.includes('micronaut') ?? false);
    if (hasMicronaut) {
      frameworks.push('micronaut');
    }
    
    // Check for Quarkus
    const hasQuarkus = (context.getTextFile('pom.xml')?.includes('quarkus') ?? false) ||
                       (context.getTextFile('build.gradle')?.includes('quarkus') ?? false);
    if (hasQuarkus) {
      frameworks.push('quarkus');
    }

    if (frameworks.length > 0) {
      metadata.frameworks = frameworks;
    }

    return {
      detected: true,
      tags: ['lang-java'],
      metadata,
    };
  }

  generateInstructions(
    _context: DetectionContext,
    metadata?: Record<string, unknown>,
  ): InstructionTemplate[] {
    const instructions: InstructionTemplate[] = [
      {
        template: 'java/lang-java.md',
        suffix: 'lang-java.md',
        targetFiles: ['**/*.java', '**/*.kt'],
      },
    ];

    // Add build tool specific instructions
    if (metadata?.buildTool === 'maven') {
      instructions.push({
        template: 'java/build-maven.md',
        suffix: 'build-maven.md',
        targetFiles: ['pom.xml'],
      });
    } else if (metadata?.buildTool === 'gradle') {
      instructions.push({
        template: 'java/build-gradle.md',
        suffix: 'build-gradle.md',
        targetFiles: ['build.gradle', 'build.gradle.kts'],
      });
    }

    // Add Spring Boot specific instructions
    if (metadata?.framework === 'spring-boot' || 
        (Array.isArray(metadata?.frameworks) && metadata.frameworks.includes('spring-boot'))) {
      instructions.push({
        template: 'java/framework-spring-boot.md',
        suffix: 'framework-spring-boot.md',
        targetFiles: ['**/*.java', '**/*.kt'],
      });
    }

    // Add Kotlin specific instructions if detected
    if (metadata?.language === 'kotlin' || metadata?.language === 'java-kotlin' || metadata?.hasKotlinPlugin) {
      instructions.push({
        template: 'java/lang-kotlin.md',
        suffix: 'lang-kotlin.md',
        targetFiles: ['**/*.kt'],
      });
    }

    return instructions;
  }
}
