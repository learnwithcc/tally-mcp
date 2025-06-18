/**
 * Staging Environment Configuration for End-to-End Integration Tests
 * 
 * This module provides configuration and utilities for running integration tests
 * against the Tally API staging environment to validate form creation workflows.
 */

import { TallyApiClientConfig } from '../../services/TallyApiClient';
import { FormConfig, QuestionType, QuestionConfig } from '../../models/form-config';
import { FormCreationTool } from '../../tools/form-creation-tool';

export interface StagingTestConfig {
  /** Tally API configuration for staging environment */
  tally: TallyApiClientConfig;
  
  /** Test execution settings */
  testSettings: {
    /** Timeout for API operations (ms) */
    apiTimeout: number;
    
    /** Timeout for form rendering validation (ms) */
    renderTimeout: number;
    
    /** Whether to clean up created forms after tests */
    cleanupAfterTests: boolean;
    
    /** Maximum number of forms to create in a single test run */
    maxFormsPerRun: number;
    
    /** Delay between form creation requests (ms) */
    rateLimitDelay: number;
  };
  
  /** Browser automation settings for UI validation */
  browserSettings: {
    /** Browser type for testing */
    browser: 'chromium' | 'firefox' | 'webkit';
    
    /** Whether to run in headless mode */
    headless: boolean;
    
    /** Viewport size for testing */
    viewport: { width: number; height: number };
    
    /** User agent for testing */
    userAgent?: string;
  };
}

/**
 * Default staging environment configuration
 */
export const STAGING_CONFIG: StagingTestConfig = {
  tally: {
    accessToken: process.env.TALLY_STAGING_API_KEY || process.env.TALLY_API_KEY || '',
    baseURL: process.env.TALLY_STAGING_BASE_URL || 'https://api.tally.so'
  },
  
  testSettings: {
    apiTimeout: 30000,
    renderTimeout: 10000,
    cleanupAfterTests: true,
    maxFormsPerRun: 50,
    rateLimitDelay: 1000
  },
  
  browserSettings: {
    browser: 'chromium',
    headless: process.env.CI === 'true',
    viewport: { width: 1280, height: 720 },
    userAgent: 'TallyMCP-E2E-Tests/1.0'
  }
};

/**
 * Test data factories for different form scenarios
 */
export class TestFormFactory {
  
  /**
   * Create a minimal form configuration (title only)
   */
  static createMinimalForm(title: string = 'E2E Test Form - Minimal'): FormConfig {
    return {
      title,
      questions: [],
      settings: {
        submissionBehavior: 'message' as any
      }
    };
  }
  
  /**
   * Create a simple contact form configuration
   */
  static createContactForm(title: string = 'E2E Test Form - Contact'): FormConfig {
    return {
      title,
      description: 'A test contact form for E2E validation',
      questions: [
        {
          id: 'name',
          type: QuestionType.TEXT,
          label: 'Full Name',
          required: true,
          placeholder: 'Enter your full name'
        },
        {
          id: 'email',
          type: QuestionType.EMAIL,
          label: 'Email Address',
          required: true,
          placeholder: 'Enter your email address'
        },
        {
          id: 'phone',
          type: QuestionType.PHONE,
          label: 'Phone Number',
          required: false,
          placeholder: 'Enter your phone number'
        },
        {
          id: 'message',
          type: QuestionType.TEXTAREA,
          label: 'Message',
          required: true,
          placeholder: 'Enter your message'
        }
      ],
      settings: {
        submissionBehavior: 'message' as any,
        showProgressBar: true,
        collectEmail: true
      }
    };
  }
  
  /**
   * Create a survey form with multiple question types
   */
  static createSurveyForm(title: string = 'E2E Test Form - Survey'): FormConfig {
    return {
      title,
      description: 'A comprehensive survey form for testing all question types',
      questions: [
        {
          id: 'satisfaction',
          type: QuestionType.RATING,
          label: 'How satisfied are you with our service?',
          required: true,
          minRating: 1,
          maxRating: 5,
          style: 'stars' as any
        },
        {
          id: 'department',
          type: QuestionType.DROPDOWN,
          label: 'Which department do you need help with?',
          required: true,
          options: [
            { id: 'sales', text: 'Sales' },
            { id: 'support', text: 'Customer Support' },
            { id: 'engineering', text: 'Engineering' },
            { id: 'billing', text: 'Billing' }
          ]
        },
        {
          id: 'preferences',
          type: QuestionType.CHECKBOXES,
          label: 'What features are most important to you? (Select all that apply)',
          required: false,
          options: [
            { id: 'speed', text: 'Fast Performance' },
            { id: 'reliability', text: 'Reliability' },
            { id: 'support', text: '24/7 Support' },
            { id: 'pricing', text: 'Competitive Pricing' },
            { id: 'features', text: 'Advanced Features' }
          ]
        },
        {
          id: 'priority',
          type: QuestionType.MULTIPLE_CHOICE,
          label: 'What is your top priority for improvements?',
          required: true,
          options: [
            { id: 'ui', text: 'User Interface' },
            { id: 'performance', text: 'Performance' },
            { id: 'documentation', text: 'Documentation' },
            { id: 'integrations', text: 'Integrations' }
          ]
        },
        {
          id: 'likelihood',
          type: QuestionType.LINEAR_SCALE,
          label: 'How likely are you to recommend us to a friend?',
          required: true,
          minValue: 0,
          maxValue: 10,
          lowLabel: 'Not likely',
          highLabel: 'Very likely'
        }
      ],
      settings: {
        submissionBehavior: 'message' as any,
        showProgressBar: true,
        showQuestionNumbers: true
      }
    };
  }
  
  /**
   * Create a complex form with conditional logic and validation
   */
  static createComplexForm(title: string = 'E2E Test Form - Complex'): FormConfig {
    return {
      title,
      description: 'A complex form with conditional logic and advanced validation',
      questions: [
        {
          id: 'user_type',
          type: QuestionType.MULTIPLE_CHOICE,
          label: 'What type of user are you?',
          required: true,
          options: [
            { id: 'individual', text: 'Individual' },
            { id: 'business', text: 'Business' },
            { id: 'nonprofit', text: 'Non-profit Organization' }
          ]
        },
        {
          id: 'company_name',
          type: QuestionType.TEXT,
          label: 'Company Name',
          required: true,
          placeholder: 'Enter your company name'
        },
        {
          id: 'company_size',
          type: QuestionType.DROPDOWN,
          label: 'Company Size',
          required: true,
          options: [
            { id: '1-10', text: '1-10 employees' },
            { id: '11-50', text: '11-50 employees' },
            { id: '51-200', text: '51-200 employees' },
            { id: '201-1000', text: '201-1000 employees' },
            { id: '1000+', text: '1000+ employees' }
          ]
        },
        {
          id: 'annual_revenue',
          type: QuestionType.NUMBER,
          label: 'Annual Revenue (USD)',
          required: false,
          placeholder: 'Enter annual revenue',
          min: 0,
          currency: 'USD'
        },
        {
          id: 'documents',
          type: QuestionType.FILE,
          label: 'Upload Supporting Documents',
          required: false,
          multiple: true,
          maxFiles: 3,
          maxFileSize: 10,
          allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
        },
        {
          id: 'signature',
          type: QuestionType.SIGNATURE,
          label: 'Digital Signature',
          required: true
        }
      ],
      settings: {
        submissionBehavior: 'message' as any,
        showProgressBar: true,
        requireAuth: false,
        allowDrafts: true
      }
    };
  }
  
  /**
   * Create an edge case form for stress testing
   */
  static createEdgeCaseForm(title: string = 'E2E Test Form - Edge Cases 🚀'): FormConfig {
    // Create a form with many questions to test performance
    const questions: QuestionConfig[] = [];
    
    for (let i = 1; i <= 20; i++) {
      questions.push({
        id: `question_${i}`,
        type: QuestionType.TEXT,
        label: `Question ${i}: This is a very long question label that tests how the form handles lengthy text and ensures proper wrapping and display across different screen sizes and devices`,
        required: i % 3 === 0, // Every third question is required
        placeholder: `Enter your response for question ${i}...`
      });
    }
    
    return {
      title: title + ' - Very Long Title That Tests Character Limits and Display Handling Across Different Screen Sizes',
      description: 'This form tests edge cases including special characters (🎉), long text, many questions, and various edge scenarios to ensure robust handling.',
      questions,
      settings: {
        submissionBehavior: 'message' as any,
        showProgressBar: true,
        showQuestionNumbers: true,
        maxSubmissions: 1000
      }
    };
  }
}

/**
 * Test utilities for staging environment
 */
export class StagingTestUtils {
  private static createdFormIds: string[] = [];
  
  /**
   * Create a form in the staging environment
   */
  static async createTestForm(
    formConfig: FormConfig,
    config: StagingTestConfig = STAGING_CONFIG
  ): Promise<{ formId: string; formUrl: string; formConfig: FormConfig }> {
    const tool = new FormCreationTool(config.tally);
    
    // Add a unique timestamp to avoid conflicts
    const timestampedConfig = {
      ...formConfig,
      title: `${formConfig.title} - ${new Date().toISOString()}`
    };
    
    const result = await tool.execute({
      formConfig: timestampedConfig
    });
    
    let formUrl = result.formUrl;
    let formId: string | undefined;

    if (formUrl) {
      formId = formUrl.split('/').pop();
    }

    // If API did not return a URL, fall back to using the form ID returned by the API (if any)
    if (!formId && (result as any).formId) {
      formId = (result as any).formId;
    }

    if (!formId) {
      throw new Error('Form creation failed: No form ID or URL returned');
    }

    // If we still don't have a URL, construct a best-guess share URL based on known pattern
    if (!formUrl) {
      // Based on Tally share-link pattern: https://tally.so/r/<slug | id>
      formUrl = `https://tally.so/r/${formId}`;
    }

    this.createdFormIds.push(formId);

    // Add rate limiting delay
    await this.delay(config.testSettings.rateLimitDelay);

    return {
      formId,
      formUrl,
      formConfig: timestampedConfig
    };
  }
  
  /**
   * Validate form exists and is accessible
   */
  static async validateFormExists(formUrl: string): Promise<boolean> {
    try {
      const response = await fetch(formUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Form validation failed:', error);
      return false;
    }
  }
  
  /**
   * Clean up created test forms
   */
  static async cleanupTestForms(): Promise<void> {
    // Note: This would require implementing form deletion in TallyApiService
    // For now, we just clear the tracking array
    console.log(`Cleaning up ${this.createdFormIds.length} test forms...`);
    this.createdFormIds = [];
  }
  
  /**
   * Add delay for rate limiting
   */
  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get list of created form IDs for tracking
   */
  static getCreatedFormIds(): string[] {
    return [...this.createdFormIds];
  }
}

/**
 * Validation helpers for form rendering
 */
export class FormRenderingValidator {
  
  /**
   * Validate that a form title is displayed correctly
   */
  static validateTitle(actualTitle: string, expectedTitle: string): boolean {
    return actualTitle.trim() === expectedTitle.trim();
  }
  
  /**
   * Validate that form fields are rendered with correct types
   */
  static validateFieldTypes(
    renderedFields: Array<{ type: string; label: string }>,
    expectedFields: Array<{ type: QuestionType; label: string }>
  ): boolean {
    if (renderedFields.length !== expectedFields.length) {
      return false;
    }
    
    return expectedFields.every((expected, index) => {
      const rendered = renderedFields[index];
      return rendered.label === expected.label &&
             this.mapQuestionTypeToHtmlType(expected.type) === rendered.type;
    });
  }
  
  /**
   * Map QuestionType to expected HTML input type
   */
  private static mapQuestionTypeToHtmlType(questionType: QuestionType): string {
    const mapping: Record<QuestionType, string> = {
      [QuestionType.TEXT]: 'text',
      [QuestionType.EMAIL]: 'email',
      [QuestionType.NUMBER]: 'number',
      [QuestionType.PHONE]: 'tel',
      [QuestionType.URL]: 'url',
      [QuestionType.DATE]: 'date',
      [QuestionType.TIME]: 'time',
      [QuestionType.TEXTAREA]: 'textarea',
      [QuestionType.DROPDOWN]: 'select',
      [QuestionType.MULTIPLE_CHOICE]: 'radio',
      [QuestionType.CHECKBOXES]: 'checkbox',
      [QuestionType.RATING]: 'rating',
      [QuestionType.LINEAR_SCALE]: 'range',
      [QuestionType.FILE]: 'file',
      [QuestionType.SIGNATURE]: 'signature',
      [QuestionType.PAYMENT]: 'payment',
      [QuestionType.MATRIX]: 'matrix',
      [QuestionType.CHOICE]: 'radio'
    };
    
    return mapping[questionType] || 'text';
  }
}

/**
 * Environment validation
 */
export function validateStagingEnvironment(): boolean {
  const required = [
    process.env.TALLY_API_KEY || process.env.TALLY_STAGING_API_KEY
  ];
  
  const missing = required.filter(env => !env);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables for staging tests');
    return false;
  }
  
  return true;
} 