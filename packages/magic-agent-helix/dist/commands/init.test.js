import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import inquirer from 'inquirer';
import ora from 'ora';
import { init } from './init'; // Import the function to test
// Mock all external dependencies
vi.mock('node:fs');
vi.mock('node:path', async () => {
    const actualPath = await vi.importActual('path');
    return {
        ...actualPath,
        resolve: vi.fn((...args) => actualPath.join(...args)), // Use join for simple path construction in tests
    };
});
vi.mock('inquirer');
vi.mock('ora');
vi.mock('picocolors', () => {
    const mockPc = {
        bold: vi.fn((str) => str),
        green: vi.fn((str) => str),
        red: vi.fn((str) => str),
        yellow: vi.fn((str) => str),
        cyan: vi.fn((str) => str),
    };
    return {
        ...mockPc,
        default: mockPc,
    };
});
vi.mock('gradient-string', () => {
    const mockGradient = {
        pastel: {
            multiline: vi.fn((str) => str),
        },
    };
    return {
        ...mockGradient,
        default: mockGradient,
    };
});
vi.mock('../types');
// Mock ora instance
const mockSpinner = {
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
};
ora.mockReturnValue(mockSpinner);
// Mock console.log
vi.spyOn(console, 'log').mockImplementation(() => { });
describe('Init Command (/src/commands/init.ts)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        path.resolve.mockImplementation((...args) => args.join('/'));
    });
    it('should create config and template files if they do not exist', async () => {
        fs.existsSync.mockReturnValue(false);
        await init();
        expect(mockSpinner.start).toHaveBeenCalledWith('Initializing AI Aligner for custom rules...');
        expect(mockSpinner.start).toHaveBeenCalledWith('Creating templates directory...');
        expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
        // 1. Config file
        expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('ai-aligner.config.json'), expect.stringContaining('"target": "github-copilot"'), 'utf-8');
        // 2. Example template file
        expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('my-custom-rule.md'), expect.stringContaining('# My Team\'s Custom Rule'), 'utf-8');
        expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('ai_templates'), { recursive: true });
        expect(mockSpinner.succeed).toHaveBeenCalledWith('Created minimal config file: ai-aligner.config.json');
        expect(mockSpinner.succeed).toHaveBeenCalledWith('Created templates directory and example file: ai_templates');
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✨ Success!'));
    });
    it('should not overwrite existing config if user declines', async () => {
        fs.existsSync.mockReturnValue(true); // Config file exists
        inquirer.prompt.mockResolvedValue({ overwrite: false });
        await init();
        expect(mockSpinner.stop).toHaveBeenCalled();
        expect(inquirer.prompt).toHaveBeenCalled();
        expect(fs.writeFileSync).not.toHaveBeenCalled();
        expect(mockSpinner.warn).toHaveBeenCalledWith('Operation cancelled.');
    });
    it('should overwrite existing config if user confirms', async () => {
        fs.existsSync.mockImplementation((p) => p.toString().endsWith('.json')); // Config exists, template dir/file doesn't
        inquirer.prompt.mockResolvedValue({ overwrite: true });
        await init();
        expect(mockSpinner.stop).toHaveBeenCalled();
        expect(inquirer.prompt).toHaveBeenCalled();
        expect(mockSpinner.start).toHaveBeenCalledWith('Overwriting existing config...');
        expect(mockSpinner.start).toHaveBeenCalledWith('Creating templates directory...');
        expect(fs.writeFileSync).toHaveBeenCalledTimes(2); // Config + example template
        expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('ai-aligner.config.json'), expect.stringContaining('"target": "github-copilot"'), 'utf-8');
        expect(mockSpinner.succeed).toHaveBeenCalledWith('Created minimal config file: ai-aligner.config.json');
    });
    it('should handle config write error', async () => {
        fs.existsSync.mockReturnValue(false);
        const writeError = new Error('Permission denied');
        fs.writeFileSync.mockImplementation(() => {
            throw writeError;
        });
        await init();
        expect(fs.writeFileSync).toHaveBeenCalled();
        expect(mockSpinner.fail).toHaveBeenCalledWith('Error writing config file: Permission denied');
    });
    it('should skip creating example template if it already exists', async () => {
        fs.existsSync.mockImplementation(() => true); // All files exist
        inquirer.prompt.mockResolvedValue({ overwrite: true }); // Overwrite config
        await init();
        expect(fs.writeFileSync).toHaveBeenCalledTimes(1); // Only config file
        expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('ai-aligner.config.json'), expect.anything(), 'utf-8');
        expect(fs.mkdirSync).not.toHaveBeenCalled();
        expect(mockSpinner.succeed).toHaveBeenCalledWith('Templates directory ai_templates already exists.');
    });
});
//# sourceMappingURL=init.test.js.map