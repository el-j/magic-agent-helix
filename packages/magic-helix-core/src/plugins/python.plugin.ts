import type {
  DetectionContext,
  DetectionPlugin,
  Instruction,
} from './plugin.interface';

export class PythonPlugin implements DetectionPlugin {
  name = 'Python';

  // We'll store what we find to build the right instructions
  private manager: 'poetry' | 'pip' | 'pipenv' | 'uv' | 'unknown' = 'unknown';
  private hasRuff = false;
  private hasBlack = false;

  async detect(context: DetectionContext): Promise<boolean> {
    const pyprojectToml = await context.getTextFile('pyproject.toml');
    if (pyprojectToml) {
      // Modern pyproject.toml exists. Let's see what's inside.
      if (pyprojectToml.includes('[tool.poetry]')) {
        this.manager = 'poetry';
      } else if (pyprojectToml.includes('[tool.uv]')) {
        // 'uv' is a new, very fast, all-in-one tool
        this.manager = 'uv';
      } else {
        this.manager = 'unknown'; // It's a toml, but maybe just for setuptools
      }

      // Check for modern tooling
      if (pyprojectToml.includes('[tool.ruff]')) {
        this.hasRuff = true;
      }
      if (pyprojectToml.includes('[tool.black]')) {
        this.hasBlack = true;
      }
      return true;
    }

    // Fallback to older dependency files
    if (context.files.includes('requirements.txt')) {
      this.manager = 'pip';
      return true;
    }

    if (context.files.includes('Pipfile')) {
      this.manager = 'pipenv';
      return true;
    }

    return false;
  }

  async generateInstructions(
    _context: DetectionContext,
  ): Promise<Instruction[]> {
    let content = '**Project Context: Python**\n\n';

    // --- 1. Dependency Management ---
    content += 'This project appears to be managed with ';
    switch (this.manager) {
      case 'poetry':
        content += '**Poetry** (`pyproject.toml`).\n';
        content +=
          '* **Key Commands:**\n' +
          '    * `poetry install`: Install all dependencies.\n' +
          '    * `poetry add <package>`: Add a new dependency.\n' +
          '    * `poetry run <command>`: Run a command inside the virtual env (e.g., `poetry run python src/main.py`).\n' +
          '* Poetry manages its own virtual environment automatically.\n';
        break;

      case 'uv':
        content += '**uv** (`pyproject.toml`).\n';
        content +=
          '* **Key Commands:**\n' +
          '    * `uv pip install -r requirements.txt` (if using reqs) or `uv pip sync` (if using pyproject).\n' +
          '    * `uv venv`: Create a virtual environment (usually `.venv`).\n' +
          '    * `source .venv/bin/activate`: Activate the virtual environment (Mac/Linux).\n' +
          '* `uv` is a high-speed, all-in-one replacement for `pip`, `venv`, and more.\n';
        break;

      case 'pip':
        content += 'classic **pip** and **venv** (`requirements.txt`).\n';
        content +=
          '* **Standard Workflow:**\n' +
          '    1. `python -m venv .venv`: Create a virtual environment (one-time setup).\n' +
          '    2. `source .venv/bin/activate`: Activate the environment (Mac/Linux).\n' +
          '    3. `pip install -r requirements.txt`: Install dependencies.\n' +
          '* **Remember to activate the virtual environment** in your shell before running `python`.\n';
        break;

      case 'pipenv':
        content += '**Pipenv** (`Pipfile`).\n';
        content +=
          '* **Key Commands:**\n' +
          '    * `pipenv install`: Install all dependencies.\n' +
          '    * `pipenv install <package>`: Add a new dependency.\n' +
          '    * `pipenv shell`: Activate the virtual environment in your shell.\n';
        break;

      default:
        content +=
          '`pyproject.toml`, but a specific manager (like Poetry) was not detected.\n';
        content += '* This likely uses standard `setuptools` and `pip`.\n';
    }

    // --- 2. Linting & Formatting ---
    if (this.hasRuff || this.hasBlack) {
      content += '\n**Code Quality:**\n';
      if (this.hasRuff) {
        content +=
          '* This project uses **Ruff** for high-speed linting and formatting.\n' +
          '    * `ruff check .`: Run the linter.\n' +
          '    * `ruff format .`: Format all files.\n';
      } else if (this.hasBlack) {
        content +=
          '* This project uses **Black** for code formatting.\n' +
          '    * `black .`: Format all files.\n';
      }
    }

    return [
      {
        filename: 'python.md',
        content: content.trim(),
      },
    ];
  }
}
