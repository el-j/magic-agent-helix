# Styling: Tailwind CSS
- **ALWAYS** use Tailwind utility classes for all styling.
- **NEVER** write custom CSS in `<style>` blocks or `.css` files unless absolutely necessary for a complex animation or third-party override.
- **LAYOUT**: Use `flex` and `grid` for all page and component layouts.
- **NAMING**: Do not use `@apply`. Stick to utility classes in the HTML/JSX.
- **RESPONSIVE**: Use responsive prefixes (`sm:`, `md:`, `lg:`) for all layouts.