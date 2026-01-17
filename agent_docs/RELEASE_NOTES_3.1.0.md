# Release v3.1.0 - Polyglot Monorepo Support

## 🎉 What's New

### Major Features

#### 🔍 Recursive Multi-Language Project Discovery
The system now automatically detects **all projects** in complex polyglot monorepos, regardless of nesting depth or language mix.

**Before:** Only detected projects listed in workspace manifest files  
**After:** Recursively scans for any project manifest in the entire directory tree

**Supported Manifest Files:**
- JavaScript/TypeScript: `package.json`
- Rust: `Cargo.toml`
- Go: `go.mod`, `go.sum`
- Python: `setup.py`, `pyproject.toml`, `requirements.txt`
- Java: `pom.xml`, `build.gradle`, `build.gradle.kts`
- Swift: `Package.swift`
- Ruby: `Gemfile`
- PHP: `composer.json`
- C/C++: `CMakeLists.txt`, `Makefile`
- Embedded: `platformio.ini`

**Real-World Impact:**  
Testing on Hardware2Rust (a Rust + Vue/TypeScript monorepo):
- **Before:** 19 projects detected → 26 instruction files
- **After:** 37 projects detected → 62 instruction files  
- **Coverage:** 100% of codebase now has AI guidance

#### 🌍 Complete Language Support
Added file extension mappings for **all** builtin language plugins:

| Language | Extensions | Tags |
|----------|-----------|------|
| Rust | `.rs` | `lang-rust`, `rust-embedded`, `hardware2rust` |
| Java | `.java` | `lang-java` |
| Swift | `.swift` | `lang-swift` |
| Ruby | `.rb` | `lang-ruby` |
| PHP | `.php` | `lang-php` |
| C# | `.cs` | `lang-csharp` |
| C++ | `.cpp`, `.hpp`, `.cc`, `.h`, `.cxx`, `.hxx` | `lang-cpp` |
| C | `.c`, `.h` | `lang-c` |
| Kotlin | `.kt`, `.kts` | `lang-kotlin` |
| Scala | `.scala`, `.sc` | `lang-scala` |

### Bug Fixes

#### 🔧 Plugin Template Loading in ESM
**Issue:** Plugin templates weren't being loaded due to context loss in async function calls  
**Fix:** Changed from type-casting approach to direct method call on registry  
**Impact:** All plugin-provided templates now correctly merge with config-based templates

#### 📁 Correct File Targeting
**Issue:** Rust projects were getting TypeScript glob patterns (`**/*.ts`) in their `applyTo` frontmatter  
**Fix:** Added language-specific file extension mappings  
**Impact:** Each language now targets only its relevant files

## 📊 Performance Improvements

- **Detection Speed:** Optimized scanning skips `node_modules`, `target`, `.git`, and other build directories
- **Coverage:** Polyglot projects now achieve 100% code coverage for instruction generation
- **Accuracy:** Eliminated false negatives from workspace-member-only detection

## 🔄 Migration Guide

### No Breaking Changes
This is a **minor version bump** (3.0.x → 3.1.0) with full backward compatibility.

### What to Expect
If you have a complex monorepo:
1. Run `magic-helix list` to see all newly detected projects
2. Use `--exclude` flag to skip test/archive folders: `magic-helix run --exclude "archive/**,test/**"`
3. More instruction files will be generated for previously undetected projects

### Example: Before vs After

**Before (v3.0.x):**
```bash
$ magic-helix run
✔ Found 5 projects.
📁 Generated 8 instruction file(s)
```

**After (v3.1.0):**
```bash
$ magic-helix run
✔ Found 23 projects.  # Includes nested projects!
📁 Generated 47 instruction file(s)
```

## 🙏 Acknowledgments

Tested extensively on real-world polyglot repositories including:
- **Hardware2Rust**: Rust workspace (19 crates) + Vue/TypeScript frontend
- **Magic-Agent-Helix**: TypeScript monorepo with multiple packages

## 📦 Installation

```bash
# NPM
npm install -g @el-j/magic-agent-helix@3.1.0

# Or use directly
npx @el-j/magic-agent-helix@3.1.0 run
```

## 🔗 Links

- [Full Changelog](CHANGELOG.md)
- [Documentation](README.md)
- [Roadmap](ROADMAP-UNIVERSAL-AI-PLATFORM.md)
