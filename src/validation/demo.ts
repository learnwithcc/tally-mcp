/**
 * Demonstration of MCP Tool Schema Validation Framework
 * 
 * This script shows how to use the validation framework to validate
 * the tools defined in this project.
 */

import { MCPToolValidator } from './mcp-tool-validator';
import { ValidationReporter } from './validation-reporter';
import { MCPTool } from './types';

/**
 * Sample tools from the current project (extracted from server.ts)
 */
const CURRENT_PROJECT_TOOLS: MCPTool[] = [
  {
    name: 'create_form',
    description: 'Create a new Tally form with specified fields and configuration',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Form title' },
        description: { type: 'string', description: 'Form description' },
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['text', 'email', 'number', 'textarea', 'select', 'checkbox', 'radio'] },
              label: { type: 'string' },
              required: { type: 'boolean' },
              options: { type: 'array', items: { type: 'string' } }
            },
            required: ['type', 'label']
          }
        },
        settings: {
          type: 'object',
          properties: {
            isPublic: { type: 'boolean' },
            allowMultipleSubmissions: { type: 'boolean' },
            showProgressBar: { type: 'boolean' }
          }
        }
      },
      required: ['title', 'fields']
    }
  },
  {
    name: 'modify_form',
    description: 'Modify an existing Tally form',
    inputSchema: {
      type: 'object',
      properties: {
        formId: { type: 'string', description: 'ID of the form to modify' },
        title: { type: 'string', description: 'New form title' },
        description: { type: 'string', description: 'New form description' },
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['text', 'email', 'number', 'textarea', 'select', 'checkbox', 'radio'] },
              label: { type: 'string' },
              required: { type: 'boolean' },
              options: { type: 'array', items: { type: 'string' } }
            },
            required: ['type', 'label']
          }
        }
      },
      required: ['formId']
    }
  },
  {
    name: 'get_form',
    description: 'Retrieve information about a specific Tally form',
    inputSchema: {
      type: 'object',
      properties: {
        formId: { type: 'string', description: 'ID of the form to retrieve' }
      },
      required: ['formId']
    }
  }
];

/**
 * Example of invalid tools for testing
 */
const INVALID_TOOLS: MCPTool[] = [
  {
    name: '', // Invalid: empty name
    description: 'Invalid tool with empty name',
    inputSchema: {
      type: 'object',
      properties: {
        param: { type: 'string' }
      }
    }
  },
  {
    name: 'invalid-tool',
    description: 'Short', // Invalid: too short description
    inputSchema: {
      type: 'object',
      properties: {
        param: { type: 'invalid-type' } // Invalid: bad type
      }
    }
  },
  {
    name: 'list', // Invalid: reserved name
    description: 'Tool with reserved name that conflicts with MCP protocol',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' }
      },
      required: ['nonexistent'] // Invalid: required field not in properties
    }
  }
];

/**
 * Demonstrate validation of current project tools
 */
export function demonstrateValidation(): void {
  console.log('🧪 MCP Tool Schema Validation Framework Demo\n');

  // Create validator instance
  const validator = new MCPToolValidator({
    strict: true,
    checkUniqueNames: true,
    deepValidation: true
  });

  // Create reporter instance
  const reporter = new ValidationReporter({
    detailed: true,
    includeMetrics: true,
    colorize: true
  });

  console.log('✅ Validating Current Project Tools:');
  console.log('=' .repeat(50));

  // Validate current project tools
  const currentToolsReport = validator.generateReport(CURRENT_PROJECT_TOOLS);
  
  if (currentToolsReport.overall.valid) {
    console.log('🎉 All current project tools are valid!');
    console.log(`✨ ${currentToolsReport.toolCount} tools validated successfully`);
    
    if (currentToolsReport.overall.warnings.length > 0) {
      console.log(`⚠️  Found ${currentToolsReport.overall.warnings.length} warnings:`);
      currentToolsReport.overall.warnings.forEach(warning => {
        console.log(`   - ${warning.message}`);
      });
    }
  } else {
    console.log('❌ Some tools have validation errors:');
    console.log(reporter.generateTextReport(currentToolsReport));
  }

  console.log('\n🔍 Performance Metrics:');
  console.log(`   Duration: ${currentToolsReport.metrics.validationDurationMs}ms`);
  console.log(`   Rules executed: ${currentToolsReport.metrics.rulesExecuted}`);
  console.log(`   Avg time per tool: ${currentToolsReport.metrics.averageTimePerTool.toFixed(2)}ms`);

  console.log('\n\n❌ Demonstrating Validation with Invalid Tools:');
  console.log('=' .repeat(50));

  // Validate invalid tools to show error detection
  const invalidToolsReport = validator.generateReport(INVALID_TOOLS);
  console.log(reporter.generateTextReport(invalidToolsReport));

  console.log('\n📊 JSON Report Example (first few lines):');
  console.log('=' .repeat(50));
  const jsonReport = JSON.parse(reporter.generateJsonReport(currentToolsReport));
  console.log(JSON.stringify({
    timestamp: jsonReport.timestamp,
    validatorVersion: jsonReport.validatorVersion,
    mcpVersion: jsonReport.mcpVersion,
    toolCount: jsonReport.toolCount,
    overallValid: jsonReport.overall.valid,
    errorCount: jsonReport.overall.summary.errorCount,
    warningCount: jsonReport.overall.summary.warningCount
  }, null, 2));

  console.log('\n🎯 Validation Framework Features Demonstrated:');
  console.log('=' .repeat(50));
  console.log('✅ Tool name validation (format, uniqueness, reserved names)');
  console.log('✅ Description requirements (minimum length)');
  console.log('✅ JSON Schema structure validation');
  console.log('✅ Type checking and enum validation');
  console.log('✅ Required field consistency checking');
  console.log('✅ Performance metrics tracking');
  console.log('✅ Multiple report formats (text, JSON, CSV)');
  console.log('✅ Configurable validation rules');
  console.log('✅ Error categorization by severity');

  console.log('\n🚀 Ready for integration into your MCP project!');
}

/**
 * Export for use in other modules
 */
export { CURRENT_PROJECT_TOOLS, INVALID_TOOLS };

// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateValidation();
} 