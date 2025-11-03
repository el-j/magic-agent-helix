# AI Convention Aligner - Project File List

Here is the complete file structure for the package. Use this as your guide for creating the correct folders and files.

## Root Directory (`/`)

* `.gitignore`

* `package.json`

* `README.md`

* `tsconfig.json`

## `scripts/` Directory

* `scripts/copy-templates.js`

## `src/` Directory

* `src/built-in-config.ts`

* `src/cli.ts`

* `src/types.ts`

### `src/commands/` Directory

* `src/commands/init.ts`

* `src/commands/run.ts`

### `src/default_templates/` Directory

* **`src/default_templates/generic/`**

  * `src/default_templates/generic/lang-typescript.md`

  * `src/default_templates/generic/state-rxjs.md`

  * `src/default_templates/generic/style-tailwind.md`

  * `src/default_templates/generic/test-vitest.md`

* **`src/default_templates/nestjs/`**

  * `src/default_templates/nestjs/nestjs-core.md`

* **`src/default_templates/react/`**

  * `src/default_templates/react/react-core.md`

  * `src/default_templates/react/react-zustand.md`

* **`src/default_templates/vue/`**

  * `src/default_templates/vue/style-primevue.md`

  * `src/default_templates/vue/vue-core.md`

  * `src/default_templates/vue/vue-pinia.md`