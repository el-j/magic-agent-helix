/**
 * C/C++ Language Plugin
 *
 * Detects C/C++ projects via:
 * - platformio.ini (PlatformIO/ESP32/Arduino)
 * - CMakeLists.txt (CMake)
 * - Makefile
 * - *.ino files (Arduino sketches)
 * - .cpp/.h files
 */

import * as path from 'node:path';
import type { ProjectMetadata, TemplateDefinition } from '@el-j/magic-helix-core';
import { BasePlugin } from '../base/BasePlugin';

interface PlatformIOConfig {
  board?: string;
  platform?: string;
  framework?: string;
  libs?: string[];
}

export class CppPlugin extends BasePlugin {
  name = 'cpp';
  displayName = 'C/C++';
  version = '3.0.0';
  priority = 85;
  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    const tags: string[] = [];
    const dependencies: Record<string, string> = {};
    let manifestFile: string | undefined;
    let projectName = this.getProjectName(projectPath);

    // Detect PlatformIO project
    const platformioConfig = await this.detectPlatformIO(projectPath);
    if (platformioConfig) {
      tags.push('platformio');
      manifestFile = 'platformio.ini';

      if (platformioConfig.board) {
        tags.push(`board-${platformioConfig.board}`);
      }
      if (platformioConfig.platform) {
        tags.push(`platform-${platformioConfig.platform}`);

        // Common platforms
        if (platformioConfig.platform.includes('espressif32')) {
          tags.push('esp32');
        }
        if (platformioConfig.platform.includes('espressif8266')) {
          tags.push('esp8266');
        }
        if (platformioConfig.platform.includes('atmelavr')) {
          tags.push('arduino');
        }
      }
      if (platformioConfig.framework) {
        tags.push(`framework-${platformioConfig.framework}`);
        if (platformioConfig.framework === 'arduino') {
          tags.push('arduino');
        }
      }
      if (platformioConfig.libs) {
        for (const lib of platformioConfig.libs) {
          dependencies[lib] = '*';
        }
      }
    }

    // Detect CMake project
    const hasCMake = this.fileExists(projectPath, 'CMakeLists.txt');
    if (hasCMake) {
      tags.push('cmake');
      if (!manifestFile) manifestFile = 'CMakeLists.txt';

      // Try to extract project name from CMakeLists.txt
      const cmakeContent = this.readFile(projectPath, 'CMakeLists.txt');
      if (cmakeContent) {
        const projectMatch = cmakeContent.match(/project\s*\(\s*([^\s)]+)/i);
        if (projectMatch) {
          projectName = projectMatch[1];
        }
      }
    }

    // Detect Makefile
    const hasMakefile =
      this.fileExists(projectPath, 'Makefile') ||
      this.fileExists(projectPath, 'makefile');
    if (hasMakefile) {
      tags.push('makefile');
      if (!manifestFile) manifestFile = 'Makefile';
    }

    // Detect Arduino sketches
    const hasIno = await this.hasFiles(projectPath, '*.ino');
    if (hasIno) {
      tags.push('arduino');
      if (!manifestFile) manifestFile = '*.ino';
    }

    // Detect C++ source files
    const hasCpp = await this.hasFiles(projectPath, '**/*.{cpp,c,h,hpp}');
    if (hasCpp) {
      tags.push('cpp');
      if (!manifestFile) manifestFile = '*.cpp';
    }

    // Must have at least one C++ indicator
    if (tags.length === 0) {
      return null;
    }

    return {
      language: 'C/C++',
      name: projectName,
      dependencies,
      manifestFile,
      projectPath,
      tags,
    };
  }

  /**
   * Parse platformio.ini configuration
   */
  private async detectPlatformIO(
    projectPath: string,
  ): Promise<PlatformIOConfig | null> {
    if (!this.fileExists(projectPath, 'platformio.ini')) {
      return null;
    }

    const content = this.readFile(projectPath, 'platformio.ini');
    if (!content) return null;

    const config: PlatformIOConfig = {
      libs: [],
    };

    const lines = content.split('\n');
    let inEnv = false;
    let currentKey: string | null = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Detect environment section
      if (trimmed.startsWith('[env:')) {
        inEnv = true;
        currentKey = null;
        continue;
      }
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        inEnv = false;
        currentKey = null;
        continue;
      }

      if (inEnv || !config.board) {
        // Parse key-value pairs
        const match = trimmed.match(/^(\w+)\s*=\s*(.*)$/);
        if (match) {
          const [, key, value] = match;
          currentKey = key;
          switch (key) {
            case 'board':
              config.board = value.trim();
              break;
            case 'platform':
              config.platform = value.trim();
              break;
            case 'framework':
              config.framework = value.trim();
              break;
            case 'lib_deps':
              // lib_deps can be multiline, value might be empty if libs are on next lines
              if (value.trim()) {
                config.libs?.push(value.trim());
              }
              break;
          }
        } else if (
          currentKey === 'lib_deps' &&
          trimmed &&
          !trimmed.startsWith('[')
        ) {
          // Continuation line for lib_deps (indented library names)
          config.libs?.push(trimmed);
        }
      }
    }

    return config.board || config.platform ? config : null;
  }

  getTemplates(): TemplateDefinition[] {
    const dirname = this.getDirname(import.meta.url);
    return [
      {
        name: 'cpp-core',
        tags: ['cpp'],
        content: this.getCppTemplate(),
      },
      {
        name: 'platformio-core',
        tags: ['platformio'],
        content: this.getPlatformIOTemplate(),
      },
      {
        name: 'arduino-core',
        tags: ['arduino'],
        content: this.getArduinoTemplate(),
      },
    ];
  }

  getDependencyTagMap() {
    return {
      // Common C++ libraries
      boost: 'boost',
      fmt: 'fmt',
      spdlog: 'spdlog',
      googletest: 'gtest',
      catch2: 'catch2',

      // Arduino/PlatformIO libraries
      'Adafruit GFX Library': 'adafruit-gfx',
      WiFi: 'wifi',
      ESP32: 'esp32',
      FastLED: 'fastled',
      ArduinoJson: 'arduino-json',
    };
  }

  getConfigFileTagMap() {
    return {
      'platformio.ini': 'platformio',
      'CMakeLists.txt': 'cmake',
      Makefile: 'makefile',
      '.clang-format': 'clang-format',
      '.clang-tidy': 'clang-tidy',
    };
  }

  private getCppTemplate(): string {
    return `# C/C++ Development Guidelines

This project uses C/C++.

## Project Structure
- Organize headers and implementation files clearly
- Use proper include guards or \`#pragma once\`
- Separate interface from implementation

## Code Style
- Follow modern C++ practices (C++11/14/17/20)
- Use RAII for resource management
- Prefer smart pointers over raw pointers
- Use const correctness

## Build System
- Use CMake or Makefile for build configuration
- Keep build files maintainable
- Document build dependencies

## Testing
- Write unit tests for core functionality
- Use GoogleTest, Catch2, or similar frameworks
- Test edge cases and error conditions
`;
  }

  private getPlatformIOTemplate(): string {
    return `# PlatformIO Development Guidelines

This is a PlatformIO embedded project.

## Project Structure
- Source code in \`src/\`
- Libraries in \`lib/\`
- Include files in \`include/\`
- Tests in \`test/\`

## Development Workflow
- Use PlatformIO CLI or IDE for building
- Test on hardware early and often
- Use serial monitor for debugging
- Manage dependencies via \`platformio.ini\`

## Code Practices
- Keep \`setup()\` and \`loop()\` focused
- Use proper pin definitions
- Handle interrupts carefully
- Consider power consumption

## Hardware Integration
- Document pin configurations
- Test hardware connections before coding
- Use appropriate voltage levels
- Follow manufacturer datasheets
`;
  }

  private getArduinoTemplate(): string {
    return `# Arduino Development Guidelines

This is an Arduino project.

## Project Structure
- Main sketch (.ino file)
- Additional tabs for organization
- Libraries in Arduino libraries folder

## Code Practices
- Use \`setup()\` for initialization
- Keep \`loop()\` non-blocking when possible
- Use \`delay()\` sparingly
- Free resources properly

## Hardware
- Document pin assignments
- Use proper resistor values
- Consider current limitations
- Test connections before powering

## Debugging
- Use Serial.print() for debugging
- Check Serial Monitor baud rate
- Validate sensor readings
- Test incrementally
`;
  }
}
