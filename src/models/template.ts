/**
 * Form Template Data Models
 *
 * This file contains TypeScript interfaces and enums for managing pre-built
 * form templates. These models support template categorization, versioning,
 * and the structure for storing and retrieving form templates.
 */

import { FormConfig } from './form-config';

// ===============================
// Enums and Constants
// ===============================

/**
 * Categories for organizing form templates.
 */
export enum TemplateCategory {
  REGISTRATION = 'registration',
  FEEDBACK = 'feedback',
  SURVEY = 'survey',
  CONTACT = 'contact',
  APPLICATION = 'application',
  EVENT = 'event',
  ECOMMERCE = 'ecommerce',
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  HUMAN_RESOURCES = 'human_resources',
  CUSTOM = 'custom',
}

// ===============================
// Interfaces
// ===============================

/**
 * Defines the structure of a pre-built form template.
 */
export interface FormTemplate {
  /**
   * Unique identifier for the template.
   */
  id: string;

  /**
   * The name of the template.
   */
  name: string;

  /**
   * A brief description of the template's purpose.
   */
  description: string;

  /**
   * The category this template belongs to.
   */
  category: TemplateCategory;

  /**
   * Version of the template for tracking updates.
   */
  version: string;

  /**
   * The core form configuration, defining the structure and questions.
   */
  formConfig: FormConfig;

  /**
   * Preview data or sample content for the template.
   */
  previewData?: Record<string, any>;

  /**
   * Tags for discoverability.
   */
  tags?: string[];

  /**
   * Timestamp of when the template was created.
   */
  createdAt: string;

  /**
   * Timestamp of the last update.
   */
  updatedAt: string;
}

/**
 * Represents a collection of form templates, typically organized by category.
 */
export interface TemplateRegistry {
  /**
   * A record of form templates, keyed by their ID.
   */
  [templateId: string]: FormTemplate;
} 