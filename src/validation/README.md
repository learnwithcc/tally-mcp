# MCP Tool Schema Validation Framework

A comprehensive validation framework for Model Context Protocol (MCP) tool schemas, ensuring compliance with the MCP specification and JSON Schema standards.

## Features

### 🔍 Comprehensive Validation
- **Tool Structure**: Validates tool name, description, and input schema
- **JSON Schema Compliance**: Ensures proper JSON Schema format and types
- **MCP Specification**: Validates against MCP protocol version 2024-11-05
- **Reserved Names**: Checks for conflicts with MCP protocol methods
- **Unique Names**: Validates tool name uniqueness across all tools

### 📊 Advanced Schema Analysis
- **Depth Checking**: Prevents overly complex nested schemas (configurable max depth)
- **Type Validation**: Validates JSON Schema types and enum values
- **Required Fields**: Ensures required fields are properly defined
- **Constraint Validation**: Validates schema constraints (min/max length, etc.)

### 📈 Performance & Reporting
- **Performance Metrics**: Tracks validation duration and rules executed
- **Multiple Report Formats**: Text, JSON, and CSV output formats
- **Detailed Error Messages**: Clear error descriptions with paths and expected values
- **Severity Levels**: ERROR, WARNING, and INFO categorization

### ⚙️ Flexible Configuration
- **Strict/Non-strict modes**: Configurable validation strictness
- **Custom Rules**: Add your own validation rules
- **Rule Management**: Enable/disable specific validation rules
- **Configurable Limits**: Adjust schema depth, error limits, etc.

## Quick Start

```typescript
import { MCPToolValidator, ValidationReporter } from './validation';

// Create validator with default configuration
const validator = new MCPToolValidator({
  strict: true,
  checkUniqueNames: true,
  deepValidation: true
});

// Your MCP tools
const tools = [
  {
    name: 'my_tool',
    description: 'A sample tool that does something useful',
    inputSchema: {
      type: 'object',
      properties: {
        param1: { type: 'string', description: 'First parameter' },
        param2: { type: 'number', description: 'Second parameter' }
      },
      required: ['param1']
    }
  }
];

// Validate tools
const report = validator.generateReport(tools);

// Generate formatted report
const reporter = new ValidationReporter();
if (report.overall.valid) {
  console.log('✅ All tools are valid!');
} else {
  console.log(reporter.generateTextReport(report));
}
```

## Core Components

### MCPToolValidator
Main orchestrator class that runs all validation rules and generates reports.

```typescript
const validator = new MCPToolValidator({
  strict: true,                    // Enable strict validation
  mcpVersion: '2024-11-05',       // MCP specification version
  checkDeprecated: true,          // Check for deprecated features
  validateJsonSchemaDraft: true,  // Validate JSON Schema draft compliance
  maxSchemaDepth: 10,            // Maximum allowed schema nesting
  checkUniqueNames: true,        // Validate tool name uniqueness
  deepValidation: true           // Perform deep schema validation
});
```

### ValidationReporter
Generates formatted reports in multiple formats.

```typescript
const reporter = new ValidationReporter({
  detailed: true,           // Include detailed error information
  includeMetrics: true,     // Include performance metrics
  includeSummary: true,     // Include summary statistics
  includeToolResults: true, // Include individual tool results
  maxErrorsPerTool: 10     // Limit errors shown per tool
});

// Generate different report formats
const textReport = reporter.generateTextReport(report);
const jsonReport = reporter.generateJsonReport(report);
const csvReport = reporter.generateCsvReport(report);
```

### SchemaValidator
Deep JSON Schema validation with type-specific rules.

```typescript
const schemaValidator = new SchemaValidator({
  strict: true,
  validateJsonSchemaDraft: true,
  maxSchemaDepth: 10
});

const result = schemaValidator.validateSchema(inputSchema);
```

## Validation Rules

The framework includes 7 built-in validation rules:

1. **tool-name-required**: Tool name must be non-empty
2. **tool-name-format**: Tool name format validation (alphanumeric, _, -)
3. **tool-description-required**: Description must be meaningful (min 10 chars)
4. **input-schema-required**: Input schema must be a valid object
5. **json-schema-structure**: JSON Schema structure compliance
6. **schema-depth-check**: Schema nesting depth validation
7. **required-fields-format**: Required fields format validation

### Custom Rules

Add your own validation rules:

```typescript
validator.addValidationRule({
  id: 'custom-rule',
  description: 'My custom validation rule',
  severity: ValidationSeverity.WARNING,
  validate: (tool, context) => {
    const errors = [];
    // Your validation logic here
    if (someCondition) {
      errors.push({
        code: 'CUSTOM_ERROR',
        message: 'Custom validation failed',
        severity: ValidationSeverity.WARNING,
        path: 'field.path'
      });
    }
    return errors;
  }
});
```

## Error Types

### Severity Levels
- **ERROR**: Critical issues that must be fixed
- **WARNING**: Issues that should be addressed but don't break functionality
- **INFO**: Informational messages and suggestions

### Common Error Codes
- `TOOL_NAME_REQUIRED`: Tool name is missing or empty
- `TOOL_NAME_INVALID_FORMAT`: Tool name contains invalid characters
- `TOOL_NAME_RESERVED`: Tool name conflicts with MCP protocol
- `TOOL_DESCRIPTION_TOO_SHORT`: Description is too short
- `INPUT_SCHEMA_REQUIRED`: Input schema is missing
- `JSON_SCHEMA_TYPE_INVALID`: Invalid JSON Schema type
- `SCHEMA_DEPTH_EXCEEDED`: Schema nesting too deep
- `REQUIRED_FIELD_NOT_DEFINED`: Required field not in properties

## Integration with Existing Projects

The framework is designed to integrate seamlessly with existing MCP projects:

1. **Extract your current tools** from your server implementation
2. **Convert to MCPTool format** (name, description, inputSchema)
3. **Run validation** and generate reports
4. **Fix any issues** identified by the validator
5. **Integrate into CI/CD** for ongoing validation

### Example Integration

```typescript
// Extract tools from your existing MCP server
function extractToolsFromServer(): MCPTool[] {
  // Get tools from your server's tool list implementation
  const toolsList = server.getToolsList();
  
  return toolsList.tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema
  }));
}

// Validate in your build process
const tools = extractToolsFromServer();
const validator = new MCPToolValidator();
const report = validator.generateReport(tools);

if (!report.overall.valid) {
  console.error('❌ Tool validation failed!');
  console.error(new ValidationReporter().generateTextReport(report));
  process.exit(1);
}
```

## Demo

Run the included demonstration:

```bash
npx ts-node src/validation/demo.ts
```

This will validate the current project's tools and demonstrate the framework's capabilities with both valid and invalid examples.

## Files

- `index.ts` - Main exports and module interface
- `types.ts` - TypeScript type definitions
- `constants.ts` - Validation rules and MCP constants
- `mcp-tool-validator.ts` - Main validator orchestrator
- `schema-validator.ts` - JSON Schema validation utilities
- `validation-utils.ts` - Helper utilities
- `validation-reporter.ts` - Report generation
- `demo.ts` - Demonstration script

## Requirements

- TypeScript 5.0+
- Zod (already included in project dependencies)
- Node.js 18+

The framework is ready for immediate use and integration into your MCP project! 