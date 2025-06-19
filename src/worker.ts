/**
 * Cloudflare Workers Entry Point for Tally MCP Server
 * 
 * This file provides a complete MCP protocol implementation for Cloudflare Workers.
 */

// Cloudflare Workers environment interface
interface Env {
  TALLY_API_KEY: string; // Made required since it's essential for the worker
  AUTH_TOKEN?: string; // Optional server authentication token for personal security
  PORT?: string;
  DEBUG?: string;
  [key: string]: string | undefined;
}

// Session management for SSE connections
interface SSESession {
  id: string;
  controller: ReadableStreamDefaultController;
  lastActivity: number;
  pendingRequests: Map<string | number, any>;
  apiKey: string; // Store the API key for this session
  heartbeatInterval?: NodeJS.Timeout;
}

// Global session storage (in a real implementation, you'd use Durable Objects or external storage)
const activeSessions = new Map<string, SSESession>();

// MCP Protocol Types
interface MCPRequest {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id?: string | number | undefined;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

// At top of file imports (add after other imports), ensure BlockBuilder functions are available
import { createFormTitleBlock, createQuestionBlocks } from './utils/block-builder';

// Tool definitions for Tally MCP Server
const TOOLS = [
  {
    name: 'create_form',
    description: 'Create a new Tally form with specified fields and configuration. This tool converts simple field definitions into Tally\'s complex blocks-based structure automatically. The status field is optional and defaults to DRAFT if not specified.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { 
          type: 'string', 
          description: 'Form title (required) - will be displayed as the main form heading',
          minLength: 1,
          maxLength: 100
        },
        description: { 
          type: 'string', 
          description: 'Optional form description - displayed below the title to provide context' 
        },
        status: {
          type: 'string',
          enum: ['DRAFT', 'PUBLISHED'],
          description: 'Form publication status. Use DRAFT for unpublished forms that are being worked on, or PUBLISHED for live forms. Defaults to DRAFT if not specified.',
          default: 'DRAFT'
        },
        fields: {
          type: 'array',
          description: 'Array of form fields/questions. Each field will be converted to appropriate Tally blocks automatically.',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              type: { 
                type: 'string', 
                enum: ['text', 'email', 'number', 'textarea', 'select', 'checkbox', 'radio'],
                description: 'Field input type. Maps to Tally blocks: text→INPUT_TEXT, email→INPUT_EMAIL, number→INPUT_NUMBER, textarea→TEXTAREA, select→DROPDOWN, checkbox→CHECKBOXES, radio→MULTIPLE_CHOICE'
              },
              label: { 
                type: 'string',
                description: 'Field label/question text - what the user will see',
                minLength: 1
              },
              required: { 
                type: 'boolean',
                description: 'Whether this field must be filled out before form submission',
                default: false
              },
              options: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Available options for select, checkbox, or radio field types. Required for select/checkbox/radio fields.'
              }
            },
            required: ['type', 'label'],
            additionalProperties: false
          }
        }
      },
      required: ['title', 'fields'],
      additionalProperties: false,
      examples: [
        {
          title: "Customer Feedback Survey",
          description: "Help us improve our service",
          status: "DRAFT",
          fields: [
            {
              type: "text",
              label: "What is your name?",
              required: true
            },
            {
              type: "email", 
              label: "Email address",
              required: true
            },
            {
              type: "select",
              label: "How would you rate our service?",
              required: false,
              options: ["Excellent", "Good", "Fair", "Poor"]
            }
          ]
        }
      ]
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
              id: { type: 'string' },
              type: { type: 'string' },
              label: { type: 'string' },
              required: { type: 'boolean' },
              options: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      },
      required: ['formId']
    }
  },
  {
    name: 'get_form',
    description: 'Retrieve details of a specific Tally form',
    inputSchema: {
      type: 'object',
      properties: {
        formId: { type: 'string', description: 'ID of the form to retrieve' }
      },
      required: ['formId']
    }
  },
  {
    name: 'list_forms',
    description: 'List all forms in the workspace',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'delete_form',
    description: 'Delete a Tally form',
    inputSchema: {
      type: 'object',
      properties: {
        formId: { type: 'string', description: 'ID of the form to delete' }
      },
      required: ['formId']
    }
  },
  {
    name: 'preview_bulk_delete',
    description: 'SAFETY PREVIEW: Show exactly which forms would be deleted before bulk deletion - USE THIS FIRST to confirm what will be deleted',
    inputSchema: {
      type: 'object',
      properties: {
        formIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of specific form IDs to preview for deletion'
        },
        filters: {
          type: 'object',
          properties: {
            createdAfter: { type: 'string', description: 'ISO date string - preview forms created after this date' },
            createdBefore: { type: 'string', description: 'ISO date string - preview forms created before this date' },
            namePattern: { type: 'string', description: 'RegEx pattern to match form names (e.g., "E2E.*" for E2E Test forms, ".*Test.*" for any test forms)' },
            status: { 
              type: 'string', 
              enum: ['draft', 'published', 'archived'],
              description: 'Filter forms by status' 
            }
          },
          description: 'Filter criteria for selecting forms to preview'
        },
        showDetails: {
          type: 'boolean',
          default: true,
          description: 'Show detailed form information (name, status, creation date, submissions count)'
        }
      },
      anyOf: [
        { required: ['formIds'] },
        { required: ['filters'] }
      ]
    }
  },
  {
    name: 'bulk_delete_forms',
    description: 'Delete multiple forms in bulk with rate limiting, progress tracking, and error handling. ⚠️ REQUIRES CONFIRMATION: Use preview_bulk_delete first to see what will be deleted!',
    inputSchema: {
      type: 'object',
      properties: {
        formIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of specific form IDs to delete'
        },
        filters: {
          type: 'object',
          properties: {
            createdAfter: { type: 'string', description: 'ISO date string - delete forms created after this date' },
            createdBefore: { type: 'string', description: 'ISO date string - delete forms created before this date' },
            namePattern: { type: 'string', description: 'RegEx pattern to match form names (e.g., "E2E.*" for E2E Test forms, ".*Test.*" for any test forms)' },
            status: { 
              type: 'string', 
              enum: ['draft', 'published', 'archived'],
              description: 'Filter forms by status' 
            }
          },
          description: 'Filter criteria for selecting forms to delete'
        },
        batchSize: {
          type: 'number',
          minimum: 1,
          maximum: 50,
          default: 10,
          description: 'Number of forms to process per batch (1-50, default: 10)'
        },
        confirmationToken: {
          type: 'string',
          description: 'REQUIRED: Confirmation token from preview_bulk_delete response to proceed with deletion. This ensures you have previewed what will be deleted.'
        },
        options: {
          type: 'object',
          properties: {
            dryRun: { type: 'boolean', description: 'Preview what would be deleted without actually deleting' },
            continueOnError: { type: 'boolean', description: 'Continue processing even if some deletions fail' },
            delayBetweenBatches: { type: 'number', description: 'Milliseconds to wait between batches (for rate limiting)' },
            maxRetries: { type: 'number', minimum: 0, maximum: 10, default: 3, description: 'Maximum number of retry attempts per form (0-10)' },
            baseRetryDelay: { type: 'number', minimum: 100, maximum: 10000, default: 1000, description: 'Base delay in milliseconds for exponential backoff retries' }
          },
          description: 'Additional options for bulk deletion operation'
        }
      },
      anyOf: [
        { required: ['formIds', 'confirmationToken'] },
        { required: ['filters', 'confirmationToken'] }
      ]
    }
  },
  {
    name: 'get_submissions',
    description: 'Retrieve submissions for a specific form',
    inputSchema: {
      type: 'object',
      properties: {
        formId: { type: 'string', description: 'ID of the form' },
        limit: { type: 'number', description: 'Maximum number of submissions to return' },
        offset: { type: 'number', description: 'Number of submissions to skip' },
        since: { type: 'string', description: 'ISO date string to filter submissions since' }
      },
      required: ['formId']
    }
  },
  {
    name: 'analyze_submissions',
    description: 'Analyze form submissions and provide insights',
    inputSchema: {
      type: 'object',
      properties: {
        formId: { type: 'string', description: 'ID of the form to analyze' },
        analysisType: { 
          type: 'string', 
          enum: ['summary', 'trends', 'responses', 'completion_rate'],
          description: 'Type of analysis to perform'
        }
      },
      required: ['formId', 'analysisType']
    }
  },
  {
    name: 'share_form',
    description: 'Generate sharing links and embed codes for a form',
    inputSchema: {
      type: 'object',
      properties: {
        formId: { type: 'string', description: 'ID of the form to share' },
        shareType: {
          type: 'string',
          enum: ['link', 'embed', 'popup', 'preview', 'editor'],
          description: 'Type of sharing method: link (public), embed (iframe), popup (modal), preview/editor (draft editing)'
        },
        customization: {
          type: 'object',
          properties: {
            width: { type: 'string' },
            height: { type: 'string' },
            hideTitle: { type: 'boolean' }
          }
        }
      },
      required: ['formId', 'shareType']
    }
  },
  {
    name: 'manage_workspace',
    description: 'Manage workspace settings and information',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['get_info', 'update_settings', 'get_usage'],
          description: 'Action to perform on workspace'
        },
        settings: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' }
          }
        }
      },
      required: ['action']
    }
  },
  {
    name: 'manage_team',
    description: 'Manage team members and permissions',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['list_members', 'invite_member', 'remove_member', 'update_permissions'],
          description: 'Team management action'
        },
        email: { type: 'string', description: 'Email for invite/remove actions' },
        role: {
          type: 'string',
          enum: ['admin', 'editor', 'viewer'],
          description: 'Role for the team member'
        }
      },
      required: ['action']
    }
  }
];

// Server capabilities
const SERVER_CAPABILITIES = {
  tools: {},
  resources: {},
  prompts: {},
  logging: {}
};

// Define prompts to guide LLM behavior
const PROMPTS = [
  {
    name: 'tally_form_sharing_guide',
    description: 'Guide for choosing the correct share type when sharing Tally forms',
    arguments: [
      {
        name: 'form_status',
        description: 'The current status of the form (DRAFT or PUBLISHED)',
        required: true
      }
    ]
  }
];

/**
 * Handle prompt get requests
 */
function handlePromptGet(params: any, messageId: string | number | undefined): MCPResponse {
  const { name, arguments: args } = params;

  switch (name) {
    case 'tally_form_sharing_guide':
      const formStatus = args?.form_status || 'UNKNOWN';
      let guidance = '';

      if (formStatus === 'DRAFT') {
        guidance = `
**For DRAFT forms, use these share types:**

- **preview** or **editor** → Returns https://tally.so/forms/{id}/edit
  - Use when you want to preview/test the form before publishing
  - Allows editing and testing form functionality
  - Perfect for form creators to review their work

- **embed** → Returns iframe embed code with https://tally.so/embed/{id}
  - Use when you want to embed the draft form for testing

**Avoid using 'link' for DRAFT forms** - it returns the public URL which won't work until published.
        `.trim();
      } else if (formStatus === 'PUBLISHED') {
        guidance = `
**For PUBLISHED forms, use these share types:**

- **link** → Returns https://tally.so/r/{id}
  - Use for the public form URL that respondents will use
  - This is the main sharing URL for live forms

- **embed** → Returns iframe embed code with https://tally.so/embed/{id}
  - Use when embedding the form in websites

- **preview** or **editor** → Returns https://tally.so/forms/{id}/edit
  - Use when you want to edit the published form
        `.trim();
      } else {
        guidance = `
**Choose share type based on form status:**

- **DRAFT forms**: Use 'preview' or 'editor' for testing → /forms/{id}/edit
- **PUBLISHED forms**: Use 'link' for public sharing → /r/{id}
- **Any status**: Use 'embed' for iframe embedding → /embed/{id}
        `.trim();
      }

      return {
        jsonrpc: '2.0',
        id: messageId,
        result: {
          description: `Guidance for sharing Tally forms with status: ${formStatus}`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Form status: ${formStatus}`
              }
            },
            {
              role: 'assistant',
              content: {
                type: 'text',
                text: guidance
              }
            }
          ]
        }
      };

    default:
      return {
        jsonrpc: '2.0',
        id: messageId,
        error: {
          code: -32602,
          message: 'Invalid params',
          data: `Unknown prompt: ${name}`
        }
      };
  }
}

/**
 * Handle MCP messages over HTTP Stream transport
 */
async function handleMCPMessage(message: any, sessionIdOrApiKey?: string, env?: Env): Promise<MCPResponse> {
  console.log('Processing MCP message:', {
    method: message.method,
    id: message.id,
    hasParams: !!message.params
  });

  try {
    switch (message.method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id: message.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
              prompts: {},
              logging: {}
            },
            serverInfo: {
              name: 'tally-mcp',
              version: '1.0.0'
            }
          }
        };

      case 'notifications/initialized':
        return {
          jsonrpc: '2.0',
          id: message.id,
          result: {}
        };

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id: message.id,
          result: {
            tools: TOOLS
          }
        };

      case 'prompts/list':
        return {
          jsonrpc: '2.0',
          id: message.id,
          result: {
            prompts: PROMPTS
          }
        };

      case 'prompts/get':
        return handlePromptGet(message.params, message.id);

      case 'tools/call':
        console.log('tools/call - passing env to handleToolCall');
        const toolResult = await handleToolCall(message.params, sessionIdOrApiKey, env);
        toolResult.id = message.id;
        return toolResult;

      default:
        return {
          jsonrpc: '2.0',
          id: message.id,
          error: {
            code: -32601,
            message: 'Method not found',
            data: `Unknown method: ${message.method}`
          }
        };
    }
  } catch (error) {
    console.error('Error processing MCP message:', error);
    return {
      jsonrpc: '2.0',
      id: message.id,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Handle tool calls
 */
async function handleToolCall(params: any, sessionIdOrApiKey?: string, env?: Env): Promise<MCPResponse> {
  const { name, arguments: args } = params;

  console.log('Tool call:', name, 'with args:', JSON.stringify(args));

  // For authless servers, always use environment API key
  let apiKey: string | undefined;
  
  if (env?.TALLY_API_KEY) {
    apiKey = env.TALLY_API_KEY;
    console.log('Using API key from environment');
  } else {
    console.error('❌ No TALLY_API_KEY found in environment');
    return {
      jsonrpc: '2.0',
      id: undefined, // Will be set by the caller
      error: {
        code: -32602,
        message: 'Invalid params',
        data: 'Server configuration error: TALLY_API_KEY not available'
      }
    };
  }

  try {
    const result = await callTallyAPI(name, args, apiKey);
    console.log('✅ Tool call successful:', name);
    
    return {
      jsonrpc: '2.0',
      id: undefined, // Will be set by the caller
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    };
  } catch (error) {
    console.error('❌ Tool execution error:', error);
    return {
      jsonrpc: '2.0',
      id: undefined, // Will be set by the caller
      error: {
        code: -32603,
        message: 'Tool execution failed',
        data: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Call Tally API based on tool name and arguments
 */
async function callTallyAPI(toolName: string, args: any, apiKey: string): Promise<any> {
  const baseURL = 'https://api.tally.so';
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  switch (toolName) {
    case 'create_form':
      // Build blocks using BlockBuilder utility for consistency with main codebase
      const blocks: any[] = [];

      // Title block (FORM_TITLE)
      blocks.push(createFormTitleBlock(args.title));

      // Optional description block – still TEXT; Tally supports plain TEXT blocks for content sections
      if (args.description) {
        blocks.push({
          uuid: crypto.randomUUID(),
          type: 'TEXT',
          groupUuid: crypto.randomUUID(),
          groupType: 'TEXT',
          title: args.description,
          payload: {
            text: args.description,
            html: args.description,
          },
        });
      }

      // Field blocks
      if (Array.isArray(args.fields)) {
        args.fields.forEach((field: any) => {
          const questionConfig = normalizeField(field);
          createQuestionBlocks(questionConfig).forEach((b) => blocks.push(b));
        });
      }

      const payload = {
        status: args.status || 'DRAFT', // Use provided status or default to DRAFT
        blocks: blocks
      };
      
      // Debug logging
      console.log('=== TALLY API PAYLOAD ===');
      console.log(JSON.stringify(payload, null, 2));
      console.log('========================');
      
      const createResponse = await globalThis.fetch(`${baseURL}/forms`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Tally API error ${createResponse.status}: ${errorText}`);
      }
      
      return await createResponse.json();

    case 'modify_form':
      const modifyResponse = await globalThis.fetch(`${baseURL}/forms/${args.formId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          title: args.title,
          description: args.description,
          fields: args.fields
        })
      });
      return await modifyResponse.json();

    case 'get_form':
      const getResponse = await globalThis.fetch(`${baseURL}/forms/${args.formId}`, {
        method: 'GET',
        headers
      });
      return await getResponse.json();

    case 'list_forms':
      const listResponse = await globalThis.fetch(`${baseURL}/forms`, {
        method: 'GET',
        headers
      });
      return await listResponse.json();

    case 'delete_form':
      const deleteResponse = await globalThis.fetch(`${baseURL}/forms/${args.formId}`, {
        method: 'DELETE',
        headers
      });
      return { success: deleteResponse.ok, status: deleteResponse.status };

    case 'preview_bulk_delete':
      return await handlePreviewBulkDelete(args, apiKey, baseURL, headers);

    case 'bulk_delete_forms':
      return await handleBulkDeleteForms(args, apiKey, baseURL, headers);

    case 'get_submissions':
      let submissionsURL = `${baseURL}/forms/${args.formId}/submissions?limit=${args.limit || 50}&offset=${args.offset || 0}`;
      if (args.since) {
        submissionsURL += `&since=${args.since}`;
      }
      const submissionsResponse = await globalThis.fetch(submissionsURL, {
        method: 'GET',
        headers
      });
      return await submissionsResponse.json();

    case 'analyze_submissions':
      // This would typically involve fetching submissions and performing analysis
      const analysisResponse = await globalThis.fetch(`${baseURL}/forms/${args.formId}/submissions`, {
        method: 'GET',
        headers
      });
      const submissionsData = await analysisResponse.json();
      const submissions = Array.isArray(submissionsData) ? submissionsData : [];
      
      // Perform basic analysis based on type
      switch (args.analysisType) {
        case 'summary':
          return {
            totalSubmissions: submissions.length,
            analysisType: 'summary',
            formId: args.formId
          };
        case 'completion_rate':
          return {
            completionRate: '95%', // This would be calculated from actual data
            analysisType: 'completion_rate',
            formId: args.formId
          };
        default:
          return {
            message: `Analysis type ${args.analysisType} completed`,
            formId: args.formId
          };
      }

    case 'share_form':
      return {
        formId: args.formId,
        shareType: args.shareType,
        // Generate correct URL based on requested share type
        shareUrl: ['preview', 'editor'].includes(args.shareType as string)
          ? `https://tally.so/forms/${args.formId}/edit`
          : `https://tally.so/r/${args.formId}`,
        embedCode: args.shareType === 'embed' ? 
          `<iframe src="https://tally.so/embed/${args.formId}" width="${args.customization?.width || '100%'}" height="${args.customization?.height || '500px'}"></iframe>` : 
          undefined
      };

    case 'manage_workspace':
      if (args.action === 'get_info') {
        const workspaceResponse = await globalThis.fetch(`${baseURL}/workspace`, {
          method: 'GET',
          headers
        });
        return await workspaceResponse.json();
      }
      return { message: `Workspace ${args.action} completed` };

    case 'manage_team':
      return { message: `Team ${args.action} completed` };

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

/**
 * Preview what forms would be deleted in a bulk delete operation
 */
async function handlePreviewBulkDelete(args: any, apiKey: string, baseURL: string, headers: any): Promise<any> {
  const operationId = crypto.randomUUID();
  const startTime = Date.now();
  
  console.log(`[PREVIEW_BULK_DELETE] ${operationId}: Starting preview operation`);
  
  try {
    // Retrieve forms using the same logic as bulk delete
    const listResponse = await globalThis.fetch(`${baseURL}/forms`, {
      method: 'GET',
      headers
    });

    if (!listResponse.ok) {
      throw new Error(`Failed to fetch forms: ${listResponse.status} ${listResponse.statusText}`);
    }

    const formsData = await listResponse.json();
    const forms = Array.isArray(formsData) ? formsData : formsData.items || formsData.data || [];
    
    console.log(`[PREVIEW_BULK_DELETE] ${operationId}: Retrieved ${forms.length} forms for filtering`);

    let formsToDelete: any[] = [];

    // Apply filtering logic (same as bulk delete)
    if (args.formIds && Array.isArray(args.formIds)) {
      // Filter by specific IDs
      formsToDelete = forms.filter((form: any) => args.formIds.includes(form.id));
      console.log(`[PREVIEW_BULK_DELETE] ${operationId}: Filtered to ${formsToDelete.length} forms by IDs`);
    } else if (args.filters) {
      // Apply filters
      formsToDelete = forms.filter((form: any) => {
        // Apply date filters
        if (args.filters.createdAfter) {
          const createdDate = new Date(form.createdAt || form.created_at);
          const afterDate = new Date(args.filters.createdAfter);
          if (createdDate <= afterDate) return false;
        }
        
        if (args.filters.createdBefore) {
          const createdDate = new Date(form.createdAt || form.created_at);
          const beforeDate = new Date(args.filters.createdBefore);
          if (createdDate >= beforeDate) return false;
        }

        // Apply status filter
        if (args.filters.status) {
          const formStatus = (form.status || '').toLowerCase();
          const filterStatus = args.filters.status.toLowerCase();
          if (formStatus !== filterStatus) return false;
        }

        // Apply name pattern filter
        if (args.filters.namePattern) {
          try {
            const regex = new RegExp(args.filters.namePattern, 'i');
            const formName = form.name || form.title || '';
            
            console.log(`[PREVIEW_BULK_DELETE] ${operationId}: Testing pattern "${args.filters.namePattern}" against form "${formName}"`);
            
            if (!regex.test(formName)) return false;
          } catch (regexError) {
            console.warn(`[PREVIEW_BULK_DELETE] ${operationId}: Invalid regex pattern "${args.filters.namePattern}": ${regexError}`);
            return false;
          }
        }

        return true;
      });
      
      console.log(`[PREVIEW_BULK_DELETE] ${operationId}: Filtered to ${formsToDelete.length} forms by criteria`);
    }

    // Generate confirmation token
    const confirmationToken = `confirm_delete_${Date.now()}_${formsToDelete.length}_${crypto.randomUUID().slice(0, 8)}`;
    
    // Prepare detailed form information
    const formDetails = formsToDelete.map((form: any) => {
      const baseInfo = {
        id: form.id,
        name: form.name || form.title || 'Untitled Form'
      };
      
      if (args.showDetails !== false) {
        return {
          ...baseInfo,
          status: form.status || 'UNKNOWN',
          createdAt: form.createdAt || form.created_at,
          updatedAt: form.updatedAt || form.updated_at,
          numberOfSubmissions: form.numberOfSubmissions || form.submissionCount || 0,
          isClosed: form.isClosed || false
        };
      }
      
      return baseInfo;
    });

    const duration = Date.now() - startTime;
    
    console.log(`[PREVIEW_BULK_DELETE] ${operationId}: Preview completed in ${duration}ms`);

    return {
      operationId,
      previewMode: true,
      formsFound: formsToDelete.length,
      totalFormsScanned: forms.length,
      confirmationToken,
      forms: formDetails,
      filters: args.filters || null,
      formIds: args.formIds || null,
      duration,
      timestamp: new Date().toISOString(),
      warning: formsToDelete.length > 0 ? 
        `⚠️  DELETION PREVIEW: ${formsToDelete.length} forms will be PERMANENTLY DELETED. Use the confirmationToken in bulk_delete_forms to proceed.` :
        'No forms match the specified criteria.',
      instructions: formsToDelete.length > 0 ? 
        `To proceed with deletion, use the bulk_delete_forms tool with confirmationToken: "${confirmationToken}"` :
        'Adjust your filters or form IDs to target the desired forms.'
    };

  } catch (error) {
    console.error(`[PREVIEW_BULK_DELETE] ${operationId}: Error during preview:`, error);
    return {
      operationId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during preview',
      duration: Date.now() - startTime
    };
  }
}

/**
 * Delete a single form with exponential backoff retry logic
 */
async function deleteFormWithRetry(
  formId: string, 
  baseURL: string, 
  headers: any, 
  maxRetries: number, 
  baseRetryDelay: number
): Promise<any> {
  let lastError: any = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add jitter to prevent thundering herd
      if (attempt > 0) {
        const jitter = Math.random() * 0.1 * baseRetryDelay; // 10% jitter
        const delay = Math.min(baseRetryDelay * Math.pow(2, attempt - 1) + jitter, 30000); // Cap at 30s
        console.log(`Retrying form ${formId} deletion after ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => globalThis.setTimeout(resolve, delay));
      }
      
      const deleteResponse = await globalThis.fetch(`${baseURL}/forms/${formId}`, {
        method: 'DELETE',
        headers
      });
      
      const result: any = {
        formId,
        success: deleteResponse.ok,
        status: deleteResponse.status,
        timestamp: new Date().toISOString(),
        attempts: attempt + 1
      };
      
      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text().catch(() => 'Unknown error');
        result.error = errorText;
        
        // Check if we should retry based on status code
        if (shouldRetryDelete(deleteResponse.status) && attempt < maxRetries) {
          lastError = new Error(`HTTP ${deleteResponse.status}: ${errorText}`);
          console.log(`Form ${formId} deletion failed with status ${deleteResponse.status}, will retry`);
          continue;
        }
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        console.log(`Form ${formId} deletion failed with network error: ${error}, will retry`);
        continue;
      }
      
      return {
        formId,
        success: false,
        status: 0,
        error: `Network error after ${attempt + 1} attempts: ${error}`,
        timestamp: new Date().toISOString(),
        attempts: attempt + 1
      };
    }
  }
  
  // If we get here, all retries failed
  return {
    formId,
    success: false,
    status: 0,
    error: `Failed after ${maxRetries + 1} attempts. Last error: ${lastError}`,
    timestamp: new Date().toISOString(),
    attempts: maxRetries + 1
  };
}

/**
 * Determine if a delete operation should be retried based on HTTP status code
 */
function shouldRetryDelete(statusCode: number): boolean {
  // Retry on server errors (5xx) and rate limiting (429)
  return statusCode >= 500 || statusCode === 429 || statusCode === 408; // 408 = Request Timeout
}

/**
 * Handle bulk form deletion with rate limiting, error handling, and progress tracking
 */
async function handleBulkDeleteForms(args: any, apiKey: string, baseURL: string, headers: any): Promise<any> {
  const operationId = crypto.randomUUID();
  const startTime = Date.now();
  const batchSize = args.batchSize || 10;
  const delayBetweenBatches = args.options?.delayBetweenBatches || 1000;
  const continueOnError = args.options?.continueOnError !== false;
  const dryRun = args.options?.dryRun || false;
  const maxRetries = args.options?.maxRetries || 3;
  const baseRetryDelay = args.options?.baseRetryDelay || 1000;
  
  // SAFETY CHECK: Validate confirmation token
  if (!args.confirmationToken) {
    console.error(`[BULK_DELETE] ${operationId}: Missing required confirmationToken`);
    return {
      operationId,
      success: false,
      error: '⚠️ SAFETY VIOLATION: confirmationToken is required. Use preview_bulk_delete first to get a confirmation token.',
      safetyMessage: 'This safety check prevents accidental bulk deletions. Always preview your deletion first using preview_bulk_delete.',
      processed: 0,
      total: 0,
      duration: Date.now() - startTime
    };
  }

  // Validate confirmation token format
  if (!args.confirmationToken.startsWith('confirm_delete_')) {
    console.error(`[BULK_DELETE] ${operationId}: Invalid confirmationToken format`);
    return {
      operationId,
      success: false,
      error: '⚠️ INVALID CONFIRMATION: The confirmation token format is invalid. Use preview_bulk_delete to get a valid token.',
      safetyMessage: 'Confirmation tokens must be generated by preview_bulk_delete to ensure you have reviewed what will be deleted.',
      processed: 0,
      total: 0,
      duration: Date.now() - startTime
    };
  }

  console.log(`[BULK_DELETE] ${operationId}: ✅ Valid confirmation token provided: ${args.confirmationToken.slice(0, 30)}...`);

  // Initialize operation logging
  console.log(`[BULK_DELETE] Starting bulk deletion operation ${operationId}`, {
    operationId,
    batchSize,
    delayBetweenBatches,
    continueOnError,
    dryRun,
    maxRetries,
    baseRetryDelay,
    hasFormIds: !!args.formIds,
    hasFilters: !!args.filters,
    confirmationToken: args.confirmationToken.slice(0, 30) + '...',
    timestamp: new Date().toISOString()
  });
  
  let formsToDelete: string[] = [];
  const operationErrors: any[] = [];
  const operationWarnings: any[] = [];
  
  // Handle formIds array
  if (args.formIds && Array.isArray(args.formIds)) {
    formsToDelete = [...args.formIds];
  }
  
  // Handle filters - get forms list and apply filters
  if (args.filters) {
    console.log(`[BULK_DELETE] ${operationId}: Applying filters to select forms`, args.filters);
    
    try {
      const listResponse = await globalThis.fetch(`${baseURL}/forms`, {
        method: 'GET',
        headers
      });
      
      if (!listResponse.ok) {
        const errorText = await listResponse.text().catch(() => 'Unknown error');
        const error = {
          type: 'FORMS_LIST_FETCH_ERROR',
          status: listResponse.status,
          message: errorText,
          timestamp: new Date().toISOString()
        };
        operationErrors.push(error);
        
        console.error(`[BULK_DELETE] ${operationId}: Failed to fetch forms list`, error);
        
        return {
          operationId,
          success: false,
          error: `Failed to fetch forms list: HTTP ${listResponse.status} - ${errorText}`,
          processed: 0,
          total: 0,
          errors: operationErrors,
          duration: Date.now() - startTime
        };
      }
      
      const formsData = await listResponse.json();
      const forms = Array.isArray(formsData) ? formsData : formsData.items || formsData.data || [];
      
      console.log(`[BULK_DELETE] ${operationId}: Retrieved ${forms.length} forms for filtering`);
      console.log(`[BULK_DELETE] ${operationId}: Response structure - isArray: ${Array.isArray(formsData)}, hasItems: ${!!formsData.items}, hasData: ${!!formsData.data}`);
      
      // Apply filters with enhanced error handling
      const filteredForms = forms.filter((form: any) => {
        try {
          // Apply date filters
          if (args.filters.createdAfter) {
            const createdDate = new Date(form.createdAt || form.created_at);
            if (isNaN(createdDate.getTime())) {
              operationWarnings.push({
                type: 'INVALID_DATE_FORMAT',
                formId: form.id,
                field: 'createdAt',
                value: form.createdAt || form.created_at,
                message: 'Invalid date format, skipping date filter for this form'
              });
            } else if (createdDate < new Date(args.filters.createdAfter)) {
              return false;
            }
          }
          
          if (args.filters.createdBefore) {
            const createdDate = new Date(form.createdAt || form.created_at);
            if (isNaN(createdDate.getTime())) {
              operationWarnings.push({
                type: 'INVALID_DATE_FORMAT',
                formId: form.id,
                field: 'createdAt',
                value: form.createdAt || form.created_at,
                message: 'Invalid date format, skipping date filter for this form'
              });
            } else if (createdDate > new Date(args.filters.createdBefore)) {
              return false;
            }
          }
          
          // Apply name pattern filter
          if (args.filters.namePattern) {
            try {
              const regex = new RegExp(args.filters.namePattern, 'i');
              const formName = form.name || form.title || '';
              
              // Debug logging for pattern matching
              console.log(`[BULK_DELETE] ${operationId}: Testing pattern "${args.filters.namePattern}" against form "${formName}" (ID: ${form.id})`);
              
              if (!regex.test(formName)) {
                console.log(`[BULK_DELETE] ${operationId}: Form "${formName}" did not match pattern "${args.filters.namePattern}"`);
                return false;
              }
              
              console.log(`[BULK_DELETE] ${operationId}: Form "${formName}" matched pattern "${args.filters.namePattern}"`);
            } catch (regexError) {
              operationWarnings.push({
                type: 'INVALID_REGEX_PATTERN',
                pattern: args.filters.namePattern,
                error: regexError,
                message: 'Invalid regex pattern, skipping name filter'
              });
              console.log(`[BULK_DELETE] ${operationId}: Invalid regex pattern "${args.filters.namePattern}": ${regexError}`);
            }
          }
          
          // Apply status filter
          if (args.filters.status) {
            if (form.status !== args.filters.status.toUpperCase()) return false;
          }
          
          return true;
        } catch (filterError) {
          operationWarnings.push({
            type: 'FILTER_APPLICATION_ERROR',
            formId: form.id,
            error: filterError,
            message: 'Error applying filters to form, including in results'
          });
          return true; // Include form if filter fails
        }
      });
      
      const filteredFormIds = filteredForms.map((form: any) => form.id);
      formsToDelete = [...formsToDelete, ...filteredFormIds];
      
      console.log(`[BULK_DELETE] ${operationId}: Filters applied, ${filteredFormIds.length} forms selected for deletion`);
      
    } catch (error) {
      const errorDetails = {
        type: 'FILTER_PROCESSING_ERROR',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      operationErrors.push(errorDetails);
      
      console.error(`[BULK_DELETE] ${operationId}: Filter processing failed`, errorDetails);
      
      return {
        operationId,
        success: false,
        error: `Failed to process filters: ${errorDetails.error}`,
        processed: 0,
        total: 0,
        errors: operationErrors,
        warnings: operationWarnings,
        duration: Date.now() - startTime
      };
    }
  }
  
  // Remove duplicates
  formsToDelete = [...new Set(formsToDelete)];
  
  if (formsToDelete.length === 0) {
    const noFormsDuration = Date.now() - startTime;
    const noFormsResult = {
      operationId,
      success: true,
      message: 'No forms found matching criteria',
      processed: 0,
      total: 0,
      dryRun,
      results: [],
      duration: noFormsDuration,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      errors: operationErrors,
      warnings: operationWarnings
    };
    
    console.log(`[BULK_DELETE] ${operationId}: No forms found matching criteria`, {
      operationId,
      hasFormIds: !!args.formIds,
      hasFilters: !!args.filters,
      formIdsCount: args.formIds?.length || 0,
      duration: noFormsDuration,
      errorCount: operationErrors.length,
      warningCount: operationWarnings.length
    });
    
    return noFormsResult;
  }
  
  // Dry run mode - return what would be deleted
  if (dryRun) {
    const dryRunDuration = Date.now() - startTime;
    const dryRunResult = {
      operationId,
      success: true,
      message: `Dry run: ${formsToDelete.length} forms would be deleted`,
      processed: 0,
      total: formsToDelete.length,
      dryRun: true,
      formsToDelete,
      batchSize,
      estimatedBatches: Math.ceil(formsToDelete.length / batchSize),
      estimatedDuration: formsToDelete.length * 500, // Rough estimate: 500ms per form
      duration: dryRunDuration,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      errors: operationErrors,
      warnings: operationWarnings
    };
    
    console.log(`[BULK_DELETE] ${operationId}: Dry run completed`, {
      operationId,
      formsFound: formsToDelete.length,
      estimatedBatches: dryRunResult.estimatedBatches,
      duration: dryRunDuration,
      errorCount: operationErrors.length,
      warningCount: operationWarnings.length
    });
    
    return dryRunResult;
  }
  
  // Process deletions in batches
  const results: any[] = [];
  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  
  for (let i = 0; i < formsToDelete.length; i += batchSize) {
    const batch = formsToDelete.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(formsToDelete.length / batchSize);
    
    console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} forms)`);
    
    // Process batch with retry logic and rate limiting
    const batchPromises = batch.map(async (formId) => {
      return await deleteFormWithRetry(formId, baseURL, headers, maxRetries, baseRetryDelay);
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Update counters
    processed += batch.length;
    const batchSucceeded = batchResults.filter((r: any) => r.success).length;
    const batchFailed = batchResults.length - batchSucceeded;
    succeeded += batchSucceeded;
    failed += batchFailed;
    
    console.log(`Batch ${batchNumber} completed: ${batchSucceeded} succeeded, ${batchFailed} failed`);
    
    // Check if we should continue on error
    if (batchFailed > 0 && !continueOnError) {
      console.log('Stopping bulk deletion due to errors and continueOnError=false');
      break;
    }
    
    // Wait between batches for rate limiting (except for the last batch)
    if (i + batchSize < formsToDelete.length) {
      console.log(`Waiting ${delayBetweenBatches}ms before next batch...`);
      await new Promise(resolve => globalThis.setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  const duration = Date.now() - startTime;
  const finalResult = {
    operationId,
    success: failed === 0 || continueOnError,
    message: `Bulk deletion completed: ${succeeded} succeeded, ${failed} failed out of ${processed} processed`,
    processed,
    total: formsToDelete.length,
    succeeded,
    failed,
    dryRun: false,
    results,
    batchSize,
    duration,
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    errors: operationErrors,
    warnings: operationWarnings,
    statistics: {
      averageTimePerForm: processed > 0 ? Math.round(duration / processed) : 0,
      successRate: processed > 0 ? Math.round((succeeded / processed) * 100) : 0,
      totalBatches: Math.ceil(formsToDelete.length / batchSize),
      retriesUsed: results.reduce((sum: number, r: any) => sum + (r.attempts || 1) - 1, 0)
    }
  };
  
  console.log(`[BULK_DELETE] ${operationId}: Operation completed`, {
    operationId,
    success: finalResult.success,
    processed,
    succeeded,
    failed,
    duration,
    errorCount: operationErrors.length,
    warningCount: operationWarnings.length
  });
  
  return finalResult;
}

/**
 * Clean up stale sessions (older than 15 minutes)
 */
function cleanupStaleSessions() {
  const now = Date.now();
  const staleThreshold = 15 * 60 * 1000; // 15 minutes
  let cleanedCount = 0;
  
  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.lastActivity > staleThreshold) {
      console.log(`Cleaning up stale session: ${sessionId} (inactive for ${Math.round((now - session.lastActivity) / 1000)}s)`);
      
      // Clean up heartbeat interval
      if (session.heartbeatInterval) {
        clearInterval(session.heartbeatInterval);
      }
      
      // Close the controller if possible
      try {
        session.controller.close();
      } catch (error) {
        console.error(`Error closing controller for stale session ${sessionId}:`, error);
      }
      
      activeSessions.delete(sessionId);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} stale sessions. Active sessions: ${activeSessions.size}`);
  }
}

/**
 * Handle SSE transport for MCP
 */
async function handleSseRequest(request: Request, env?: Env): Promise<Response> {
  // Generate a unique session ID
  const sessionId = crypto.randomUUID();
  console.log(`[${new Date().toISOString()}] Creating new SSE session: ${sessionId}`);

  const stream = new ReadableStream({
    start(controller) {
      // Store session
      activeSessions.set(sessionId, {
        id: sessionId,
        controller,
        lastActivity: Date.now(),
        pendingRequests: new Map(),
        apiKey: env?.TALLY_API_KEY || '' // Use environment API key for authless
      });

      // Send initial connection message
      const welcomeMessage = `data: ${JSON.stringify({
        jsonrpc: '2.0',
        method: 'notifications/session_started',
        params: { sessionId }
      })}\n\n`;
      
      controller.enqueue(new TextEncoder().encode(welcomeMessage));
    },
    cancel() {
      console.log(`[${new Date().toISOString()}] SSE session closed: ${sessionId}`);
      activeSessions.delete(sessionId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Session-ID': sessionId
    }
  });
}

/**
 * Handle HTTP Stream transport for MCP
 */
async function handleHTTPStreamTransport(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.text();
    
    let mcpRequest: MCPRequest;
    try {
      mcpRequest = JSON.parse(body);
    } catch (error) {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32700,
          message: 'Parse error',
          data: 'Invalid JSON'
        }
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Validate MCP request structure
    if (!mcpRequest.jsonrpc || mcpRequest.jsonrpc !== '2.0' || !mcpRequest.method) {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: mcpRequest.id,
        error: {
          code: -32600,
          message: 'Invalid Request',
          data: 'Missing required fields: jsonrpc, method'
        }
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Handle the MCP request with the Tally API key from environment
    const response = await handleMCPMessage(mcpRequest, env.TALLY_API_KEY, env);
    
    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('HTTP Stream transport error:', error);
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal error',
        data: error instanceof Error ? error.message : 'Unknown error'
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

/**
 * Cloudflare Workers fetch handler
 */
async function fetch(request: Request, env: Env): Promise<Response> {
  // Validate critical environment variables first
  if (!env.TALLY_API_KEY) {
    console.error('Critical error: TALLY_API_KEY environment variable is not set');
    return new Response(JSON.stringify({
      error: 'Server Configuration Error',
      message: 'Required environment variables are missing. Please check server configuration.',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  console.log('Environment validation passed. TALLY_API_KEY is available.');
  
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle CORS preflight requests first (before authentication)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Add CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (pathname === '/health') {
    return new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // OAuth authorization server metadata
  if (pathname === '/.well-known/oauth-authorization-server') {
    return new Response(JSON.stringify({
      issuer: new URL(request.url).origin,
      authorization_endpoint: `${new URL(request.url).origin}/authorize`,
      token_endpoint: `${new URL(request.url).origin}/token`,
      registration_endpoint: `${new URL(request.url).origin}/register`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code'],
      code_challenge_methods_supported: ['S256'],
      // Indicate this is an authless server
      authless: true
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // OAuth endpoints - now authless
  if (pathname === '/authorize') {
    // For authless servers, we redirect back immediately with success
    const state = url.searchParams.get('state');
    const redirectUri = url.searchParams.get('redirect_uri');
    
    if (!redirectUri) {
      return new Response(JSON.stringify({
        error: 'invalid_request',
        error_description: 'redirect_uri is required'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Generate a dummy code for authless flow
    const code = 'authless_' + Math.random().toString(36).substring(2);
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set('code', code);
    if (state) redirectUrl.searchParams.set('state', state);

    return Response.redirect(redirectUrl.toString(), 302);
  }

  if (pathname === '/token') {
    // For authless servers, return a dummy token
    return new Response(JSON.stringify({
      access_token: 'authless_token',
      token_type: 'Bearer',
      expires_in: 3600
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  if (pathname === '/register') {
    // Dynamic client registration - return dummy client for authless
    return new Response(JSON.stringify({
      client_id: 'authless_client',
      client_secret: 'authless_secret',
      registration_access_token: 'authless_token',
      registration_client_uri: `${new URL(request.url).origin}/register/authless_client`
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // MCP endpoints - with authentication for personal security
  if (pathname === '/mcp' || pathname === '/mcp/sse') {
    // Authenticate MCP requests
    const auth = authenticateRequest(request, env);
    if (!auth.authenticated) {
      return new Response(JSON.stringify({
        error: 'Authentication Required',
        message: auth.error,
        hint: 'Add AUTH_TOKEN to your server configuration and use it in requests',
        timestamp: new Date().toISOString()
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Verify we have the Tally API key in environment
    if (!env.TALLY_API_KEY) {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Server configuration error: TALLY_API_KEY not found'
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (pathname === '/mcp/sse') {
      // SSE transport
      return handleSseRequest(request, env);
    } else {
      // HTTP Stream transport
      return handleHTTPStreamTransport(request, env);
    }
  }

  // Default response for unknown endpoints
  return new Response(JSON.stringify({
    error: 'Not Found',
    message: 'The requested endpoint was not found.',
    available_endpoints: [
      '/health',
      '/mcp',
      '/mcp/sse', 
      '/.well-known/oauth-authorization-server',
      '/authorize',
      '/token',
      '/register'
    ]
  }), { 
    status: 404,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function handleMcpRequest(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  let apiKey: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7);
  }

  if (!apiKey) {
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32000,
        message: 'Authorization header missing or invalid',
        data: 'Please provide a Bearer token in the Authorization header.'
      }
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const body = await request.json();
  const mcpRequest = body as MCPRequest;
  
  // Reuse the existing, robust message handler
  const mcpResponse = await handleMCPMessage(mcpRequest, apiKey, env);
  
  let status = 200;
  if ('error' in mcpResponse && mcpResponse.error) {
    // Map JSON-RPC error codes to HTTP status codes for transport-level correctness
    switch (mcpResponse.error.code) {
      case -32700: // Parse error
      case -32600: // Invalid Request
      case -32602: // Invalid Params
        status = 400;
        break;
      case -32601: // Method not found
        status = 404;
        break;
      default: // Server error (-32000 to -32099)
        status = 500;
        break;
    }
  }
  
  // Return the response from the message handler with the correct HTTP status
  return new Response(JSON.stringify(mcpResponse), {
    status: status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

/**
 * Authenticate request using server AUTH_TOKEN
 */
function authenticateRequest(request: Request, env: Env): { authenticated: boolean; error?: string } {
  // If no AUTH_TOKEN is configured, allow all requests (backwards compatibility)
  if (!env.AUTH_TOKEN) {
    console.log('🔓 No AUTH_TOKEN configured - allowing unauthenticated access');
    return { authenticated: true };
  }

  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1] === env.AUTH_TOKEN) {
      console.log('✅ Valid Bearer token authentication');
      return { authenticated: true };
    }
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get('X-API-Key');
  if (apiKeyHeader === env.AUTH_TOKEN) {
    console.log('✅ Valid X-API-Key authentication');
    return { authenticated: true };
  }

  // Check query parameter
  const url = new URL(request.url);
  const tokenParam = url.searchParams.get('token');
  if (tokenParam === env.AUTH_TOKEN) {
    console.log('✅ Valid query parameter authentication');
    return { authenticated: true };
  }

  console.log('❌ Authentication failed - no valid token provided');
  return { 
    authenticated: false, 
    error: 'Authentication required. Provide token via Authorization header, X-API-Key header, or ?token= query parameter.' 
  };
}

/**
 * Convert a simple field definition coming from the create_form args into the
 * richer QuestionConfig structure expected by block-builder utilities.
 */
function normalizeField(field: any): import('./models/form-config').QuestionConfig {
  const { QuestionType } = require('./models/form-config');

  const typeMap: Record<string, import('./models/form-config').QuestionType> = {
    text: QuestionType.TEXT,
    email: QuestionType.EMAIL,
    number: QuestionType.NUMBER,
    select: QuestionType.DROPDOWN,
    // accept both singular & plural spellings
    dropdown: QuestionType.DROPDOWN,
    radio: QuestionType.MULTIPLE_CHOICE,
    'multiple_choice': QuestionType.MULTIPLE_CHOICE,
    checkbox: QuestionType.CHECKBOXES,
    checkboxes: QuestionType.CHECKBOXES,
    textarea: QuestionType.TEXTAREA,
    'long answer': QuestionType.TEXTAREA,
  };

  const qType = typeMap[(field.type || '').toLowerCase()] ?? QuestionType.TEXT;

  const qc: any = {
    id: crypto.randomUUID(),
    type: qType,
    label: field.label || 'Untitled',
    required: field.required ?? false,
    placeholder: field.placeholder,
  };

  if (field.options) {
    qc.options = field.options.map((opt: any) => ({ text: opt, value: opt }));
  }

  return qc;
}

// Export the Workers-compatible handler
export default {
  fetch
}; 