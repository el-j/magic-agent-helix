# Function Schemas Pattern

## Purpose
Document tool/function interfaces with inline JSON schemas. From **ChatGPT 4o** pattern.

## Template

```markdown
## {TOOL_NAME}

**Purpose**: {WHAT_IT_DOES}

**Parameters**:
```json
{
  "parameter1": {
    "type": "{TYPE}",
    "description": "{DESCRIPTION}",
    "required": {BOOLEAN}
  },
  "parameter2": {
    "type": "{TYPE}",
    "description": "{DESCRIPTION}",
    "required": {BOOLEAN}
  }
}
```

**Returns**: {RETURN_TYPE} - {RETURN_DESCRIPTION}

**Example**:
```
{EXAMPLE_USAGE}
```
```

## Examples

### ChatGPT (DALL-E Image Generation)
```markdown
## generate_image

**Purpose**: Creates images using DALL-E 3 based on text descriptions.

**Parameters**:
```json
{
  "prompt": {
    "type": "string",
    "description": "Detailed description of the image to generate. Should be specific and vivid.",
    "required": true
  },
  "size": {
    "type": "string",
    "enum": ["1024x1024", "1792x1024", "1024x1792"],
    "description": "Image dimensions. Use landscape for wide scenes, portrait for tall subjects.",
    "required": false,
    "default": "1024x1024"
  },
  "quality": {
    "type": "string",
    "enum": ["standard", "hd"],
    "description": "Image quality level. HD provides more detail but takes longer.",
    "required": false,
    "default": "standard"
  }
}
```

**Returns**: `ImageResult` - Object containing image URL and revised prompt

**Example**:
```
generate_image({
  prompt: "A serene Japanese garden with a koi pond, cherry blossoms, and a wooden bridge at sunset",
  size: "1792x1024",
  quality: "hd"
})
```
```

### Cline (File Reading)
```markdown
## read_file

**Purpose**: Reads contents of a file within specified line range.

**Parameters**:
```json
{
  "filePath": {
    "type": "string",
    "description": "Absolute path to the file. Must exist in workspace.",
    "required": true
  },
  "startLine": {
    "type": "number",
    "description": "Line number to start reading from (1-indexed).",
    "required": true
  },
  "endLine": {
    "type": "number",
    "description": "Line number to end reading at (inclusive, 1-indexed).",
    "required": true
  }
}
```

**Returns**: `string` - File contents between startLine and endLine

**Example**:
```
read_file({
  filePath: "/Users/me/project/src/app.ts",
  startLine: 10,
  endLine: 50
})
```

**Best Practices**:
- Read large ranges (20-50 lines) to minimize API calls
- Prefer one large read over many small reads
- Use parallel reads when examining multiple files
```

## Variables
- `{TOOL_NAME}`: Function/tool identifier
- `{WHAT_IT_DOES}`: Single-sentence purpose
- `{TYPE}`: JSON type (string, number, boolean, object, array)
- `{DESCRIPTION}`: Parameter explanation
- `{BOOLEAN}`: true/false for required field
- `{RETURN_TYPE}`: Return value type
- `{RETURN_DESCRIPTION}`: What the function returns
- `{EXAMPLE_USAGE}`: Concrete function call

## Best Practices
1. Use JSON schema format for precise typing
2. Include enums for restricted values
3. Specify default values when applicable
4. Add "Best Practices" section for complex tools
5. Show realistic examples (not placeholder values)
6. Document error cases and edge behavior
7. Benefits: Type safety, autocomplete support, clear contracts
