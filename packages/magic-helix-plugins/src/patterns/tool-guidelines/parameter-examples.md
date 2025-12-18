# Parameter Examples Pattern

## Purpose
Provide concrete examples for tool parameters with realistic values. From **v0** and **Cline** patterns.

## Template

```markdown
## {TOOL_NAME} Parameter Examples

### {PARAMETER_NAME}
- **Type**: `{TYPE}`
- **Description**: {DESCRIPTION}

**Examples**:
```
✅ GOOD: {GOOD_EXAMPLE_1}
✅ GOOD: {GOOD_EXAMPLE_2}
❌ BAD: {BAD_EXAMPLE_1} (Reason: {WHY_BAD})
❌ BAD: {BAD_EXAMPLE_2} (Reason: {WHY_BAD})
```
```

## Examples

### v0 (Component Generation)
```markdown
## create_component Parameter Examples

### componentName
- **Type**: `string`
- **Description**: Name of React component to generate

**Examples**:
```
✅ GOOD: "UserProfile"
✅ GOOD: "ProductCard"
✅ GOOD: "NavigationMenu"
❌ BAD: "userprofile" (Reason: Use PascalCase for components)
❌ BAD: "user-profile" (Reason: Hyphens not allowed in JSX names)
❌ BAD: "div" (Reason: Conflicts with HTML element)
```

### styling
- **Type**: `"tailwind" | "css-modules" | "styled-components"`
- **Description**: CSS approach to use

**Examples**:
```
✅ GOOD: "tailwind"
✅ GOOD: "css-modules"
❌ BAD: "scss" (Reason: Not in enum, use "css-modules" instead)
❌ BAD: null (Reason: Required parameter, must specify)
```
```

### Cline (File Editing)
```markdown
## replace_string_in_file Parameter Examples

### oldString
- **Type**: `string`
- **Description**: Exact literal text to replace, including 3-5 lines of context

**Examples**:
```
✅ GOOD:
```
function calculateTotal() {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.1;
  return subtotal + tax;
}
```
(Includes function signature and full body for unique match)

❌ BAD:
```
const tax = subtotal * 0.1;
```
(Too generic, might match multiple locations)

❌ BAD:
```
function calculateTotal() {
  // ...existing code...
  return subtotal + tax;
}
```
(Contains placeholder comments instead of actual code)
```

### newString
- **Type**: `string`
- **Description**: Exact replacement text with same indentation

**Examples**:
```
✅ GOOD:
```
function calculateTotal() {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * TAX_RATE; // Use constant instead of magic number
  const discount = calculateDiscount(subtotal);
  return subtotal + tax - discount;
}
```
(Preserves indentation, includes full context)

❌ BAD:
```
function calculateTotal() {
const tax = subtotal * TAX_RATE;
return subtotal + tax;
}
```
(Lost indentation, will cause syntax errors)
```
```

## Variables
- `{TOOL_NAME}`: Function/tool identifier
- `{PARAMETER_NAME}`: Specific parameter
- `{TYPE}`: TypeScript/JSON type
- `{DESCRIPTION}`: What the parameter does
- `{GOOD_EXAMPLE_X}`: Valid, idiomatic usage
- `{BAD_EXAMPLE_X}`: Invalid or non-idiomatic usage
- `{WHY_BAD}`: Explanation of what's wrong

## Best Practices
1. Show 2-3 good examples per parameter
2. Show 2-3 bad examples with explanations
3. Use realistic values (not "foo", "bar", "example")
4. Include edge cases (empty strings, large numbers, special chars)
5. Show proper formatting (indentation, quotes, escaping)
6. Demonstrate common mistakes users make
7. Benefits: Reduces trial-and-error, clarifies expectations, speeds development
