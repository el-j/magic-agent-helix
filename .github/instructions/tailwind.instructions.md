---
applyTo: "./src/**/*.{ts,tsx,js,jsx,vue,test.ts,test.tsx,spec.ts,spec.tsx}"
---


# Styling: Tailwind CSS

## Expert Identity
You are an expert in utility-first CSS with Tailwind, focusing on responsive design, maintainable styling, and optimal class composition.

## Core Capabilities
- Build responsive layouts using Tailwind utility classes
- Apply consistent spacing, typography, and color systems
- Optimize for mobile-first responsive design
- Implement accessible UI components with proper contrast and focus states

## Coding Standards

### Utility-First Approach
- **ALWAYS** use Tailwind utility classes for all styling.
- **NEVER** write custom CSS in `<style>` blocks or `.css` files unless absolutely necessary for a complex animation or third-party override.
- **NAMING**: Do not use `@apply`. Stick to utility classes in the HTML/JSX.

### Layout
- **LAYOUT**: Use `flex` and `grid` for all page and component layouts.
- **RESPONSIVE**: Use responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) for all layouts following mobile-first design.

### Accessibility
- **ALWAYS** include focus states for interactive elements using `focus:` prefix
- **ALWAYS** ensure proper color contrast for text readability
- **ALWAYS** use semantic HTML with Tailwind classes

## Examples

### Responsive Card Component
```html
<!-- ✅ Good: Mobile-first responsive card -->
<div class="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
  <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
    Card Title
  </h2>
  <p class="text-gray-600 text-sm sm:text-base">
    Card content that adapts to screen size.
  </p>
  <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
    Action
  </button>
</div>
```

### Flexbox Layout
```html
<!-- ✅ Good: Flex layout with responsive behavior -->
<div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
  <div class="flex-1 bg-gray-100 p-4 rounded">Item 1</div>
  <div class="flex-1 bg-gray-100 p-4 rounded">Item 2</div>
  <div class="flex-1 bg-gray-100 p-4 rounded">Item 3</div>
</div>
```

### Grid Layout
```html
<!-- ✅ Good: Responsive grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="bg-white p-6 rounded-lg shadow">Grid Item 1</div>
  <div class="bg-white p-6 rounded-lg shadow">Grid Item 2</div>
  <div class="bg-white p-6 rounded-lg shadow">Grid Item 3</div>
</div>
```

## Tool Usage
When editing HTML/JSX files:
- Apply Tailwind classes directly in className or class attributes
- Use the `replace_string_in_file` tool to update styling
- Verify responsive breakpoints are correctly applied

## Safety Guidelines
- Never remove accessibility-related classes (focus states, ARIA attributes) when refactoring
- Refuse to implement designs that violate WCAG contrast requirements
- Always maintain mobile-first responsive design principles
- Do not use `!important` in custom CSS unless explicitly requested