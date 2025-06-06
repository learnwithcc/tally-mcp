/**
 * Template Service
 *
 * This service is responsible for managing form templates, including creating,
 * retrieving, updating, and deleting them. It provides an interface for
 * accessing a registry of pre-built form templates and instantiating them
 * into `FormConfig` objects.
 */

import {
  FormConfig,
  FormTemplate,
  TemplateCategory,
  TemplateRegistry,
  SubmissionBehavior,
  QuestionType,
  RatingStyle,
  RequiredValidation,
  EmailValidation,
  TextareaQuestionConfig,
  EmailQuestionConfig,
  TextQuestionConfig,
  RatingQuestionConfig,
  MultipleChoiceQuestionConfig,
  QuestionOption,
} from '../models';
import { v4 as uuidv4 } from 'uuid';

// ===============================
// Mock Template Data
// ===============================

const sampleTemplates: FormTemplate[] = [
  {
    id: 'contact-form-v1',
    name: 'Simple Contact Form',
    description: 'A basic contact form with name, email, and message fields.',
    category: TemplateCategory.CONTACT,
    version: '1.0.0',
    formConfig: {
      title: 'Contact Us',
      questions: [
        {
          id: 'name',
          type: QuestionType.TEXT,
          label: 'Your Name',
          required: true,
          validation: {
            rules: [{ type: 'required', required: true, errorMessage: "Name is required." } as RequiredValidation]
          }
        } as TextQuestionConfig,
        {
          id: 'email',
          type: QuestionType.EMAIL,
          label: 'Your Email',
          required: true,
          validation: {
            rules: [
                { type: 'required', required: true, errorMessage: "Email is required." } as RequiredValidation,
                { type: 'email', errorMessage: "Please enter a valid email address." } as EmailValidation
            ]
          }
        } as EmailQuestionConfig,
        {
          id: 'message',
          type: QuestionType.TEXTAREA,
          label: 'Your Message',
          required: true,
          validation: {
            rules: [{ type: 'required', required: true, errorMessage: "Message is required." } as RequiredValidation]
          }
        } as TextareaQuestionConfig
      ],
      settings: {
        submissionBehavior: SubmissionBehavior.MESSAGE,
        submissionMessage: 'Thank you for contacting us!',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['contact', 'basic'],
  },
  {
    id: 'customer-feedback-v1',
    name: 'Customer Feedback Survey',
    description: 'A survey to collect feedback from customers.',
    category: TemplateCategory.FEEDBACK,
    version: '1.0.0',
    formConfig: {
      title: 'Customer Feedback',
      questions: [
        {
            id: 'rating',
            type: QuestionType.RATING,
            label: 'How would you rate our service?',
            required: true,
            minRating: 1,
            maxRating: 5,
            style: RatingStyle.STARS,
        } as RatingQuestionConfig,
        {
            id: 'comments',
            type: QuestionType.TEXTAREA,
            label: 'Additional Comments',
            required: false,
        } as TextareaQuestionConfig
      ],
      settings: {
        submissionBehavior: SubmissionBehavior.MESSAGE,
        submissionMessage: 'Thank you for your feedback!',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['feedback', 'survey', 'customer'],
  },
  {
    id: 'event-registration-v1',
    name: 'Event Registration Form',
    description: 'A form for registering attendees for an event.',
    category: TemplateCategory.EVENT,
    version: '1.0.0',
    formConfig: {
      title: 'Event Registration',
      questions: [
        {
          id: 'full_name',
          type: QuestionType.TEXT,
          label: 'Full Name',
          required: true,
        } as TextQuestionConfig,
        {
          id: 'email',
          type: QuestionType.EMAIL,
          label: 'Email Address',
          required: true,
          validation: {
            rules: [{ type: 'email' } as EmailValidation],
          },
        } as EmailQuestionConfig,
        {
          id: 'ticket_type',
          type: QuestionType.MULTIPLE_CHOICE,
          label: 'Ticket Type',
          required: true,
          options: [
            { text: 'General Admission', value: 'general' },
            { text: 'VIP', value: 'vip' },
          ] as QuestionOption[],
        } as MultipleChoiceQuestionConfig,
      ],
      settings: {
        submissionBehavior: SubmissionBehavior.MESSAGE,
        submissionMessage: 'Thank you for registering!',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['event', 'registration'],
  },
  {
    id: 'lead-generation-v1',
    name: 'Lead Generation Form',
    description: 'A form to capture leads for sales or marketing.',
    category: TemplateCategory.CONTACT,
    version: '1.0.0',
    formConfig: {
      title: 'Get a Demo',
      questions: [
        {
          id: 'name',
          type: QuestionType.TEXT,
          label: 'Your Name',
          required: true,
        } as TextQuestionConfig,
        {
          id: 'company_email',
          type: QuestionType.EMAIL,
          label: 'Company Email',
          required: true,
          validation: {
            rules: [{ type: 'email' } as EmailValidation],
          },
        } as EmailQuestionConfig,
        {
          id: 'company_size',
          type: QuestionType.MULTIPLE_CHOICE,
          label: 'Company Size',
          required: true,
          options: [
            { text: '1-10 employees', value: '1-10' },
            { text: '11-50 employees', value: '11-50' },
            { text: '51-200 employees', value: '51-200' },
            { text: '201+ employees', value: '201+' },
          ] as QuestionOption[],
        } as MultipleChoiceQuestionConfig,
      ],
      settings: {
        submissionBehavior: SubmissionBehavior.MESSAGE,
        submissionMessage: 'Thanks, we will be in touch!',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['lead generation', 'sales', 'marketing'],
  },
];

// ===============================
// Template Service
// ===============================

export class TemplateService {
  private templateRegistry: TemplateRegistry;

  constructor() {
    this.templateRegistry = sampleTemplates.reduce((registry, template) => {
      registry[template.id] = template;
      return registry;
    }, {} as TemplateRegistry);
  }

  /**
   * Retrieves all available form templates.
   * @returns An array of form templates.
   */
  public getTemplates(): FormTemplate[] {
    return Object.values(this.templateRegistry);
  }

  /**
   * Finds a template by its ID.
   * @param templateId The ID of the template to find.
   * @returns The form template if found, otherwise undefined.
   */
  public findTemplateById(templateId: string): FormTemplate | undefined {
    return this.templateRegistry[templateId];
  }

  /**
   * Instantiates a form from a template.
   * This will eventually involve more complex logic, like populating questions.
   * @param templateId The ID of the template to instantiate.
   * @param customTitle Optional title to override the template's default.
   * @returns A `FormConfig` object based on the template.
   */
  public instantiateTemplate(
    templateId: string,
    customTitle?: string
  ): FormConfig | undefined {
    const template = this.findTemplateById(templateId);
    if (!template) {
      return undefined;
    }

    // Deep copy the formConfig to prevent modifications to the template
    const formConfig: FormConfig = JSON.parse(
      JSON.stringify(template.formConfig)
    );

    if (customTitle) {
      formConfig.title = customTitle;
    }

    // In a real implementation, this is where you would populate the questions array
    // based on the template's definition. For now, it returns the base config.

    return formConfig;
  }

  /**
   * Creates a new form template.
   * @param templateData The data for the new template.
   * @returns The created form template.
   */
  public createTemplate(
    templateData: Omit<FormTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): FormTemplate {
    const newTemplate: FormTemplate = {
      ...templateData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.templateRegistry[newTemplate.id] = newTemplate;
    return newTemplate;
  }

  /**
   * Updates an existing form template.
   * @param templateId The ID of the template to update.
   * @param updates The partial data to update the template with.
   * @returns The updated form template, or undefined if not found.
   */
  public updateTemplate(
    templateId: string,
    updates: Partial<Omit<FormTemplate, 'id'>>
  ): FormTemplate | undefined {
    const template = this.findTemplateById(templateId);
    if (!template) {
      return undefined;
    }

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.templateRegistry[templateId] = updatedTemplate;
    return updatedTemplate;
  }

  /**
   * Deletes a form template.
   * @param templateId The ID of the template to delete.
   * @returns True if the template was deleted, false otherwise.
   */
  public deleteTemplate(templateId: string): boolean {
    if (this.templateRegistry[templateId]) {
      delete this.templateRegistry[templateId];
      return true;
    }
    return false;
  }
} 