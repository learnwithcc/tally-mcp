export * from './monitoring';
export * from './capabilities';
export * from './errors';
export * from './json-rpc';

/**
 * Enhanced field configuration with detailed properties
 * returned from API responses
 */
export interface EnrichedFieldConfiguration {
  /**
   * Generated unique identifier for the field
   */
  id: string;
  
  /**
   * Field type (text, email, number, etc.)
   */
  type: string;
  
  /**
   * Field label/title
   */
  label: string;
  
  /**
   * Field description or help text
   */
  description?: string;
  
  /**
   * Whether the field is required
   */
  required: boolean;
  
  /**
   * Placeholder text for input fields
   */
  placeholder?: string;
  
  /**
   * Field display order
   */
  order: number;
  
  /**
   * Validation rules applied to the field
   */
  validationRules?: {
    rules: Array<{
      type: string;
      errorMessage?: string;
      enabled: boolean;
      [key: string]: any;
    }>;
  };
  
  /**
   * Options for choice-based fields (select, radio, checkbox)
   */
  options?: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  
  /**
   * Conditional logic rules
   */
  conditionalLogic?: {
    showIf?: any;
    hideIf?: any;
    requireIf?: any;
  };
  
  /**
   * Type-specific properties
   */
  typeSpecificProperties?: {
    [key: string]: any;
  };
  
  /**
   * Custom metadata for the field
   */
  metadata?: {
    [key: string]: any;
  };
}

/**
 * Field ID mapping for tracking changes during form modifications
 */
export interface FieldIdMapping {
  oldId?: string;
  newId: string;
  operation: 'added' | 'modified' | 'removed' | 'unchanged';
  fieldLabel: string;
} 