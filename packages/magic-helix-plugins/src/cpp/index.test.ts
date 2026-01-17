/**
 * C/C++ Plugin Tests
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CppPlugin } from './index';

describe('CppPlugin', () => {
  let plugin: CppPlugin;
  let testDir: string;

  beforeEach(() => {
    plugin = new CppPlugin();
    // Create a temporary directory for tests
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpp-plugin-test-'));
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('detect', () => {
    it('should detect PlatformIO project with platformio.ini', async () => {
      const platformioIni = `
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
lib_deps = 
  FastLED
  ArduinoJson
`;
      fs.writeFileSync(path.join(testDir, 'platformio.ini'), platformioIni);

      const result = await plugin.detect(testDir);

      expect(result).not.toBeNull();
      expect(result?.language).toBe('C/C++');
      expect(result?.manifestFile).toBe('platformio.ini');
      expect(result?.tags).toContain('platformio');
      expect(result?.tags).toContain('esp32');
      expect(result?.tags).toContain('arduino');
      expect(result?.tags).toContain('board-esp32dev');
      expect(result?.tags).toContain('platform-espressif32');
      expect(result?.tags).toContain('framework-arduino');
      expect(result?.dependencies).toHaveProperty('FastLED');
      expect(result?.dependencies).toHaveProperty('ArduinoJson');
    });

    it('should detect CMake project with CMakeLists.txt', async () => {
      const cmakeLists = `
cmake_minimum_required(VERSION 3.10)
project(MyProject)
add_executable(myapp main.cpp)
`;
      fs.writeFileSync(path.join(testDir, 'CMakeLists.txt'), cmakeLists);
      fs.writeFileSync(path.join(testDir, 'main.cpp'), '#include <iostream>');

      const result = await plugin.detect(testDir);

      expect(result).not.toBeNull();
      expect(result?.language).toBe('C/C++');
      expect(result?.manifestFile).toBe('CMakeLists.txt');
      expect(result?.name).toBe('MyProject');
      expect(result?.tags).toContain('cmake');
      expect(result?.tags).toContain('cpp');
    });

    it('should detect Makefile project', async () => {
      const makefile = `
CC = gcc
CFLAGS = -Wall
all: main.o
`;
      fs.writeFileSync(path.join(testDir, 'Makefile'), makefile);
      fs.writeFileSync(path.join(testDir, 'main.c'), '#include <stdio.h>');

      const result = await plugin.detect(testDir);

      expect(result).not.toBeNull();
      expect(result?.language).toBe('C/C++');
      expect(result?.manifestFile).toBe('Makefile');
      expect(result?.tags).toContain('makefile');
      expect(result?.tags).toContain('cpp');
    });

    it('should detect Arduino sketch with .ino files', async () => {
      fs.writeFileSync(path.join(testDir, 'sketch.ino'), 'void setup() {}');

      const result = await plugin.detect(testDir);

      expect(result).not.toBeNull();
      expect(result?.language).toBe('C/C++');
      expect(result?.tags).toContain('arduino');
    });

    it('should detect C++ project with source files', async () => {
      fs.writeFileSync(
        path.join(testDir, 'main.cpp'),
        '#include <iostream>\nint main() {}',
      );
      fs.writeFileSync(path.join(testDir, 'main.h'), '#pragma once');

      const result = await plugin.detect(testDir);

      expect(result).not.toBeNull();
      expect(result?.language).toBe('C/C++');
      expect(result?.tags).toContain('cpp');
    });

    it('should return null for non-C++ projects', async () => {
      fs.writeFileSync(path.join(testDir, 'package.json'), '{}');

      const result = await plugin.detect(testDir);

      expect(result).toBeNull();
    });

    it('should detect ESP8266 platform', async () => {
      const platformioIni = `
[env:nodemcuv2]
platform = espressif8266
board = nodemcuv2
framework = arduino
`;
      fs.writeFileSync(path.join(testDir, 'platformio.ini'), platformioIni);

      const result = await plugin.detect(testDir);

      expect(result).not.toBeNull();
      expect(result?.tags).toContain('platformio');
      expect(result?.tags).toContain('esp8266');
      expect(result?.tags).toContain('platform-espressif8266');
    });

    it('should detect AVR/Arduino platform', async () => {
      const platformioIni = `
[env:uno]
platform = atmelavr
board = uno
framework = arduino
`;
      fs.writeFileSync(path.join(testDir, 'platformio.ini'), platformioIni);

      const result = await plugin.detect(testDir);

      expect(result).not.toBeNull();
      expect(result?.tags).toContain('platformio');
      expect(result?.tags).toContain('arduino');
      expect(result?.tags).toContain('platform-atmelavr');
    });
  });

  describe('getTemplates', () => {
    it('should provide C++ templates', () => {
      const templates = plugin.getTemplates();

      expect(templates).toHaveLength(3);
      expect(templates.map((t) => t.name)).toContain('cpp-core');
      expect(templates.map((t) => t.name)).toContain('platformio-core');
      expect(templates.map((t) => t.name)).toContain('arduino-core');
    });
  });

  describe('getDependencyTagMap', () => {
    it('should provide dependency tag mappings', () => {
      const tagMap = plugin.getDependencyTagMap?.();

      expect(tagMap).toBeDefined();
      expect(tagMap).toHaveProperty('FastLED');
      expect(tagMap).toHaveProperty('ArduinoJson');
      expect(tagMap).toHaveProperty('boost');
    });
  });

  describe('getConfigFileTagMap', () => {
    it('should provide config file tag mappings', () => {
      const configMap = plugin.getConfigFileTagMap?.();

      expect(configMap).toBeDefined();
      expect(configMap).toHaveProperty('platformio.ini', 'platformio');
      expect(configMap).toHaveProperty('CMakeLists.txt', 'cmake');
      expect(configMap).toHaveProperty('Makefile', 'makefile');
    });
  });
});
