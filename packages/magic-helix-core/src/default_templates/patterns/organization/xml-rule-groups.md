# XML Rule Groups Pattern

## Purpose
Structure instructions using XML-like tags for hierarchical organization. From **same.new** pattern.

## Template

```xml
<rules>
  <category name="{CATEGORY_NAME}">
    <rule>{RULE_1}</rule>
    <rule>{RULE_2}</rule>
    <rule>{RULE_3}</rule>
  </category>
  
  <category name="{CATEGORY_NAME_2}">
    <rule>{RULE_4}</rule>
    <rule>{RULE_5}</rule>
  </category>
</rules>
```

## Examples

### same.new (Code Generation Rules)
```xml
<rules>
  <category name="Code Style">
    <rule>Use functional components with hooks, not class components</rule>
    <rule>Prefer const over let, never use var</rule>
    <rule>Use descriptive variable names (e.g., userData not ud)</rule>
  </category>
  
  <category name="File Operations">
    <rule>Always show a preview before writing files</rule>
    <rule>Ask for confirmation before deleting or overwriting</rule>
    <rule>Use relative paths for imports within the project</rule>
  </category>
  
  <category name="Error Handling">
    <rule>Wrap async operations in try-catch blocks</rule>
    <rule>Return user-friendly error messages, not stack traces</rule>
    <rule>Log errors for debugging but don't expose internals</rule>
  </category>
</rules>
```

## Variables
- `{CATEGORY_NAME}`: Logical grouping (e.g., "Code Style", "Security", "Performance")
- `{RULE_X}`: Specific instruction within category

## Best Practices
1. Keep categories focused (5-10 rules max per category)
2. Use parallel structure for rules within a category
3. Order categories by importance (most critical first)
4. Use nested tags for sub-categories if needed:
   ```xml
   <category name="React">
     <subcategory name="Hooks">
       <rule>Always declare hooks at top level</rule>
     </subcategory>
   </category>
   ```
5. Benefits: Easy to scan, clear hierarchy, simple to add/remove sections
