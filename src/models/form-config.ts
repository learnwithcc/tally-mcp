import { z } from 'zod';

/**
 * Form Configuration Data Models
 * 
 * This file contains TypeScript interfaces and Zod schemas for form configuration,
 * questions, validation rules, and conditional logic. These models are used for
 * creating and modifying Tally forms through natural language processing.
 */

// ===============================
// Enums and Constants
// ===============================

/**
 * Supported question types for Tally forms
 */
export enum QuestionType {
  TEXT = 'text',
  EMAIL = 'email', 
  NUMBER = 'number',
  CHOICE = 'choice',
  RATING = 'rating',
  FILE = 'file',
  DATE = 'date',
  TIME = 'time',
  TEXTAREA = 'textarea',
  DROPDOWN = 'dropdown',
  CHECKBOXES = 'checkboxes',
  LINEAR_SCALE = 'linear_scale',
  MULTIPLE_CHOICE = 'multiple_choice',
  PHONE = 'phone',
  URL = 'url',
  SIGNATURE = 'signature',
  PAYMENT = 'payment',
}

/**
 * Form display themes and styles
 */
export enum FormTheme {
  DEFAULT = 'default',
  MINIMAL = 'minimal',
  MODERN = 'modern',
  CLASSIC = 'classic',
  CUSTOM = 'custom',
}

/**
 * Form submission behavior options
 */
export enum SubmissionBehavior {
  REDIRECT = 'redirect',
  MESSAGE = 'message',
  CLOSE = 'close',
  RELOAD = 'reload',
}

/**
 * Validation rule types
 */
export enum ValidationType {
  REQUIRED = 'required',
  MIN_LENGTH = 'min_length',
  MAX_LENGTH = 'max_length',
  MIN_VALUE = 'min_value',
  MAX_VALUE = 'max_value',
  PATTERN = 'pattern',
  EMAIL_FORMAT = 'email_format',
  URL_FORMAT = 'url_format',
  PHONE_FORMAT = 'phone_format',
  DATE_RANGE = 'date_range',
  FILE_TYPE = 'file_type',
  FILE_SIZE = 'file_size',
}

/**
 * Conditional logic operators
 */
export enum LogicOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_EQUAL = 'greater_equal',
  LESS_EQUAL = 'less_equal',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty',
}

/**
 * Question layout options for choice-based questions
 */
export enum QuestionLayout {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  GRID = 'grid',
}

/**
 * Rating display styles
 */
export enum RatingStyle {
  STARS = 'stars',
  NUMBERS = 'numbers',
  THUMBS = 'thumbs',
  HEARTS = 'hearts',
  FACES = 'faces',
}

/**
 * Phone number format types
 */
export enum PhoneFormat {
  US = 'US',
  INTERNATIONAL = 'INTERNATIONAL',
  CUSTOM = 'CUSTOM',
}

/**
 * Time format options
 */
export enum TimeFormat {
  TWELVE_HOUR = '12',
  TWENTY_FOUR_HOUR = '24',
}

/**
 * Payment methods
 */
export enum PaymentMethod {
  CARD = 'card',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
}

// ===============================
// Core Interfaces
// ===============================

/**
 * Base form configuration interface
 * 
 * Defines the core structure for creating and configuring Tally forms.
 * This interface is extensible to support future form properties and features.
 */
export interface FormConfig {
  /**
   * The title of the form, displayed at the top
   */
  title: string;

  /**
   * Optional description or subtitle for the form
   */
  description?: string;

  /**
   * Array of questions/fields in the form
   */
  questions: QuestionConfig[];

  /**
   * Form-level settings and configuration
   */
  settings: FormSettings;

  /**
   * Optional branding and styling configuration
   */
  branding?: BrandingConfig;

  /**
   * Optional metadata for form organization
   */
  metadata?: FormMetadata;
}

/**
 * Base question configuration interface
 * 
 * Contains common properties shared by all question types.
 */
export interface BaseQuestionConfig {
  /**
   * Unique identifier for the question (auto-generated if not provided)
   */
  id?: string;

  /**
   * Display label for the question
   */
  label: string;

  /**
   * Optional description or help text for the question
   */
  description?: string;

  /**
   * Whether the question is required for form submission
   */
  required: boolean;

  /**
   * Placeholder text for input fields
   */
  placeholder?: string;

  /**
   * Validation rules for the question
   */
  validation?: ValidationRules;

  /**
   * Conditional logic rules for showing/hiding this question
   */
  logic?: ConditionalLogic;

  /**
   * Display order/position in the form
   */
  order?: number;
}

// ===============================
// Specific Question Type Interfaces
// ===============================

/**
 * Text input question configuration
 */
export interface TextQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.TEXT;
  /**
   * Minimum character count
   */
  minLength?: number;
  /**
   * Maximum character count
   */
  maxLength?: number;
  /**
   * Input format hint (e.g., 'capitalize', 'lowercase', 'uppercase')
   */
  format?: string;
}

/**
 * Textarea (long text) question configuration
 */
export interface TextareaQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.TEXTAREA;
  /**
   * Minimum character count
   */
  minLength?: number;
  /**
   * Maximum character count
   */
  maxLength?: number;
  /**
   * Number of visible rows
   */
  rows?: number;
  /**
   * Whether to auto-resize based on content
   */
  autoResize?: boolean;
}

/**
 * Email input question configuration
 */
export interface EmailQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.EMAIL;
  /**
   * Whether to validate email format
   */
  validateFormat?: boolean;
  /**
   * Whether to suggest common email domains
   */
  suggestDomains?: boolean;
}

/**
 * Phone number input question configuration
 */
export interface PhoneQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.PHONE;
  /**
   * Phone number format/pattern
   */
  format?: PhoneFormat;
  /**
   * Custom format pattern if using CUSTOM format
   */
  customPattern?: string;
  /**
   * Whether to auto-format as user types
   */
  autoFormat?: boolean;
}

/**
 * URL input question configuration
 */
export interface UrlQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.URL;
  /**
   * Whether to validate URL format
   */
  validateFormat?: boolean;
  /**
   * Whether to require specific URL schemes (e.g., ['http', 'https'])
   */
  allowedSchemes?: string[];
}

/**
 * Number input question configuration
 */
export interface NumberQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.NUMBER;
  /**
   * Minimum allowed value
   */
  min?: number;
  /**
   * Maximum allowed value
   */
  max?: number;
  /**
   * Step value for increment/decrement
   */
  step?: number;
  /**
   * Number of decimal places allowed
   */
  decimalPlaces?: number;
  /**
   * Whether to format with thousand separators
   */
  useThousandSeparator?: boolean;
  /**
   * Currency symbol (if this is a currency input)
   */
  currency?: string;
}

/**
 * Date input question configuration
 */
export interface DateQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.DATE;
  /**
   * Minimum allowed date (ISO string)
   */
  minDate?: string;
  /**
   * Maximum allowed date (ISO string)
   */
  maxDate?: string;
  /**
   * Date format for display (e.g., 'MM/DD/YYYY', 'DD/MM/YYYY')
   */
  dateFormat?: string;
  /**
   * Whether to include time selection
   */
  includeTime?: boolean;
  /**
   * Default date value (ISO string)
   */
  defaultDate?: string;
}

/**
 * Time input question configuration
 */
export interface TimeQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.TIME;
  /**
   * Time format (12-hour or 24-hour)
   */
  format?: TimeFormat;
  /**
   * Minute step interval
   */
  minuteStep?: number;
  /**
   * Default time value (HH:MM format)
   */
  defaultTime?: string;
}

/**
 * Multiple choice question configuration
 */
export interface MultipleChoiceQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.MULTIPLE_CHOICE;
  /**
   * Available options for selection
   */
  options: QuestionOption[];
  /**
   * Whether to allow "Other" option with text input
   */
  allowOther?: boolean;
  /**
   * Whether to randomize option order
   */
  randomizeOptions?: boolean;
  /**
   * Layout style for options
   */
  layout?: QuestionLayout;
}

/**
 * Dropdown question configuration
 */
export interface DropdownQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.DROPDOWN;
  /**
   * Available options for selection
   */
  options: QuestionOption[];
  /**
   * Whether to allow "Other" option with text input
   */
  allowOther?: boolean;
  /**
   * Whether to allow search/filtering of options
   */
  searchable?: boolean;
  /**
   * Placeholder text for the dropdown
   */
  dropdownPlaceholder?: string;
}

/**
 * Checkboxes (multi-select) question configuration
 */
export interface CheckboxesQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.CHECKBOXES;
  /**
   * Available options for selection
   */
  options: QuestionOption[];
  /**
   * Minimum number of required selections
   */
  minSelections?: number;
  /**
   * Maximum number of allowed selections
   */
  maxSelections?: number;
  /**
   * Whether to allow "Other" option with text input
   */
  allowOther?: boolean;
  /**
   * Whether to randomize option order
   */
  randomizeOptions?: boolean;
  /**
   * Layout style for options
   */
  layout?: QuestionLayout;
}

/**
 * Rating question configuration
 */
export interface RatingQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.RATING;
  /**
   * Minimum rating value
   */
  minRating: number;
  /**
   * Maximum rating value
   */
  maxRating: number;
  /**
   * Labels for rating values (optional)
   */
  ratingLabels?: string[];
  /**
   * Rating display style
   */
  style?: RatingStyle;
  /**
   * Whether to show numeric values alongside icons
   */
  showNumbers?: boolean;
  /**
   * Label for low end of scale
   */
  lowLabel?: string;
  /**
   * Label for high end of scale
   */
  highLabel?: string;
}

/**
 * Linear scale question configuration
 */
export interface LinearScaleQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.LINEAR_SCALE;
  /**
   * Minimum scale value
   */
  minValue: number;
  /**
   * Maximum scale value
   */
  maxValue: number;
  /**
   * Step interval for the scale
   */
  step?: number;
  /**
   * Label for low end of scale
   */
  lowLabel?: string;
  /**
   * Label for high end of scale
   */
  highLabel?: string;
  /**
   * Whether to show numeric values on scale
   */
  showNumbers?: boolean;
}

/**
 * File upload question configuration
 */
export interface FileQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.FILE;
  /**
   * Allowed file types (MIME types or extensions)
   */
  allowedTypes?: string[];
  /**
   * Maximum file size in MB
   */
  maxFileSize?: number;
  /**
   * Maximum number of files allowed
   */
  maxFiles?: number;
  /**
   * Whether to allow multiple file selection
   */
  multiple?: boolean;
  /**
   * Upload area text/instructions
   */
  uploadText?: string;
}

/**
 * Signature question configuration
 */
export interface SignatureQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.SIGNATURE;
  /**
   * Canvas width in pixels
   */
  canvasWidth?: number;
  /**
   * Canvas height in pixels
   */
  canvasHeight?: number;
  /**
   * Pen color for signature
   */
  penColor?: string;
  /**
   * Background color for signature pad
   */
  backgroundColor?: string;
}

/**
 * Payment question configuration
 */
export interface PaymentQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.PAYMENT;
  /**
   * Payment amount in cents
   */
  amount?: number;
  /**
   * Currency code (e.g., 'USD', 'EUR')
   */
  currency: string;
  /**
   * Whether amount is fixed or user can enter custom amount
   */
  fixedAmount?: boolean;
  /**
   * Minimum amount if allowing custom amounts
   */
  minAmount?: number;
  /**
   * Maximum amount if allowing custom amounts
   */
  maxAmount?: number;
  /**
   * Payment description
   */
  paymentDescription?: string;
  /**
   * Accepted payment methods
   */
  acceptedMethods?: PaymentMethod[];
}

/**
 * Discriminated union of all question configuration types
 * 
 * This union allows TypeScript to provide proper type discrimination
 * based on the 'type' property, ensuring type safety when working
 * with different question configurations.
 */
export type QuestionConfig = 
  | TextQuestionConfig
  | TextareaQuestionConfig
  | EmailQuestionConfig
  | PhoneQuestionConfig
  | UrlQuestionConfig
  | NumberQuestionConfig
  | DateQuestionConfig
  | TimeQuestionConfig
  | MultipleChoiceQuestionConfig
  | DropdownQuestionConfig
  | CheckboxesQuestionConfig
  | RatingQuestionConfig
  | LinearScaleQuestionConfig
  | FileQuestionConfig
  | SignatureQuestionConfig
  | PaymentQuestionConfig;

// ===============================
// Type Guards and Utility Types
// ===============================

/**
 * Type guard to check if a question has options
 */
export function questionHasOptions(question: QuestionConfig): question is 
  | MultipleChoiceQuestionConfig 
  | DropdownQuestionConfig 
  | CheckboxesQuestionConfig {
  return question.type === QuestionType.MULTIPLE_CHOICE ||
         question.type === QuestionType.DROPDOWN ||
         question.type === QuestionType.CHECKBOXES;
}

/**
 * Type guard to check if a question is text-based
 */
export function isTextBasedQuestion(question: QuestionConfig): question is 
  | TextQuestionConfig 
  | TextareaQuestionConfig 
  | EmailQuestionConfig 
  | PhoneQuestionConfig 
  | UrlQuestionConfig {
  return question.type === QuestionType.TEXT ||
         question.type === QuestionType.TEXTAREA ||
         question.type === QuestionType.EMAIL ||
         question.type === QuestionType.PHONE ||
         question.type === QuestionType.URL;
}

/**
 * Type guard to check if a question is numeric
 */
export function isNumericQuestion(question: QuestionConfig): question is 
  | NumberQuestionConfig 
  | RatingQuestionConfig 
  | LinearScaleQuestionConfig {
  return question.type === QuestionType.NUMBER ||
         question.type === QuestionType.RATING ||
         question.type === QuestionType.LINEAR_SCALE;
}

/**
 * Type guard to check if a question is date/time related
 */
export function isDateTimeQuestion(question: QuestionConfig): question is 
  | DateQuestionConfig 
  | TimeQuestionConfig {
  return question.type === QuestionType.DATE ||
         question.type === QuestionType.TIME;
}

/**
 * Type guard to check if a question supports file uploads
 */
export function isFileQuestion(question: QuestionConfig): question is 
  | FileQuestionConfig 
  | SignatureQuestionConfig {
  return question.type === QuestionType.FILE ||
         question.type === QuestionType.SIGNATURE;
}

/**
 * Helper type to extract question type from question config
 */
export type QuestionTypeOf<T extends QuestionConfig> = T['type'];

/**
 * Helper type to get question config by type
 */
export type QuestionConfigByType<T extends QuestionType> = 
  T extends QuestionType.TEXT ? TextQuestionConfig :
  T extends QuestionType.TEXTAREA ? TextareaQuestionConfig :
  T extends QuestionType.EMAIL ? EmailQuestionConfig :
  T extends QuestionType.PHONE ? PhoneQuestionConfig :
  T extends QuestionType.URL ? UrlQuestionConfig :
  T extends QuestionType.NUMBER ? NumberQuestionConfig :
  T extends QuestionType.DATE ? DateQuestionConfig :
  T extends QuestionType.TIME ? TimeQuestionConfig :
  T extends QuestionType.MULTIPLE_CHOICE ? MultipleChoiceQuestionConfig :
  T extends QuestionType.DROPDOWN ? DropdownQuestionConfig :
  T extends QuestionType.CHECKBOXES ? CheckboxesQuestionConfig :
  T extends QuestionType.RATING ? RatingQuestionConfig :
  T extends QuestionType.LINEAR_SCALE ? LinearScaleQuestionConfig :
  T extends QuestionType.FILE ? FileQuestionConfig :
  T extends QuestionType.SIGNATURE ? SignatureQuestionConfig :
  T extends QuestionType.PAYMENT ? PaymentQuestionConfig :
  never;

/**
 * Utility type for question configuration factories
 */
export type QuestionConfigFactory<T extends QuestionType> = (
  baseConfig: Omit<BaseQuestionConfig, 'id'> & { id?: string }
) => QuestionConfigByType<T>;

/**
 * All question types that support choice options
 */
export type ChoiceQuestionType = 
  | QuestionType.MULTIPLE_CHOICE 
  | QuestionType.DROPDOWN 
  | QuestionType.CHECKBOXES;

/**
 * All question types that support numeric input/validation
 */
export type NumericQuestionType = 
  | QuestionType.NUMBER 
  | QuestionType.RATING 
  | QuestionType.LINEAR_SCALE;

/**
 * All question types that support text input/validation
 */
export type TextQuestionType = 
  | QuestionType.TEXT 
  | QuestionType.TEXTAREA 
  | QuestionType.EMAIL 
  | QuestionType.PHONE 
  | QuestionType.URL;

/**
 * Form-level settings and behavior configuration
 */
export interface FormSettings {
  /**
   * Whether to show a progress bar
   */
  showProgressBar?: boolean;

  /**
   * Whether to allow saving drafts
   */
  allowDrafts?: boolean;

  /**
   * Whether to show question numbers
   */
  showQuestionNumbers?: boolean;

  /**
   * Whether to shuffle question order
   */
  shuffleQuestions?: boolean;

  /**
   * Maximum number of submissions allowed
   */
  maxSubmissions?: number;

  /**
   * Whether to require authentication
   */
  requireAuth?: boolean;

  /**
   * Whether to collect respondent email
   */
  collectEmail?: boolean;

  /**
   * Form closing date (ISO string)
   */
  closeDate?: string;

  /**
   * Form opening date (ISO string)
   */
  openDate?: string;

  /**
   * Behavior after form submission
   */
  submissionBehavior: SubmissionBehavior;

  /**
   * Custom message or URL for after submission
   */
  submissionMessage?: string;

  /**
   * Redirect URL after submission (if using REDIRECT behavior)
   */
  redirectUrl?: string;

  /**
   * Whether to send confirmation emails
   */
  sendConfirmationEmail?: boolean;

  /**
   * Whether to allow multiple submissions from same user
   */
  allowMultipleSubmissions?: boolean;
}

/**
 * Form branding and styling configuration
 */
export interface BrandingConfig {
  /**
   * Form theme/style
   */
  theme: FormTheme;

  /**
   * Primary brand color (hex code)
   */
  primaryColor?: string;

  /**
   * Secondary brand color (hex code)
   */
  secondaryColor?: string;

  /**
   * Background color or image URL
   */
  background?: string;

  /**
   * Custom CSS styles
   */
  customCss?: string;

  /**
   * Logo image URL
   */
  logoUrl?: string;

  /**
   * Font family name
   */
  fontFamily?: string;

  /**
   * Button style customization
   */
  buttonStyle?: ButtonStyle;
}

/**
 * Form metadata for organization and management
 */
export interface FormMetadata {
  /**
   * Tags for categorizing the form
   */
  tags?: string[];

  /**
   * Category or folder for organization
   */
  category?: string;

  /**
   * Form creation timestamp
   */
  createdAt?: string;

  /**
   * Last modification timestamp
   */
  updatedAt?: string;

  /**
   * Form creator/owner identifier
   */
  createdBy?: string;

  /**
   * Workspace or organization identifier
   */
  workspaceId?: string;

  /**
   * Whether the form is published/public
   */
  isPublished?: boolean;

  /**
   * Whether the form is archived
   */
  isArchived?: boolean;

  /**
   * Form version number
   */
  version?: number;
}

/**
 * Button styling configuration
 */
export interface ButtonStyle {
  /**
   * Button background color
   */
  backgroundColor?: string;

  /**
   * Button text color
   */
  textColor?: string;

  /**
   * Button border radius
   */
  borderRadius?: number;

  /**
   * Button border style
   */
  border?: string;

  /**
   * Button font size
   */
  fontSize?: number;

  /**
   * Button padding
   */
  padding?: string;
}

/**
 * Option for choice-based questions
 */
export interface QuestionOption {
  /**
   * Unique identifier for the option
   */
  id?: string;

  /**
   * Display text for the option
   */
  text: string;

  /**
   * Optional value (defaults to text if not provided)
   */
  value?: string;

  /**
   * Whether this option is selected by default
   */
  isDefault?: boolean;

  /**
   * Optional image URL for the option
   */
  imageUrl?: string;

  /**
   * Additional metadata for the option
   */
  metadata?: Record<string, any>;
}

/**
 * Validation rules interface for form questions
 * 
 * Defines validation constraints that can be applied to form questions
 * to ensure data quality and compliance with business rules.
 */
export interface ValidationRules {
  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Minimum length for text inputs
   */
  minLength?: number;

  /**
   * Maximum length for text inputs
   */
  maxLength?: number;

  /**
   * Minimum value for numeric inputs
   */
  minValue?: number;

  /**
   * Maximum value for numeric inputs
   */
  maxValue?: number;

  /**
   * Regular expression pattern for validation
   */
  pattern?: string;

  /**
   * Custom validation error message
   */
  errorMessage?: string;

  /**
   * Email format validation (for email fields)
   */
  emailFormat?: boolean;

  /**
   * URL format validation (for URL fields)
   */
  urlFormat?: boolean;

  /**
   * Phone number format validation
   */
  phoneFormat?: boolean;

  /**
   * Date range validation
   */
  dateRange?: {
    min?: string;
    max?: string;
  };

  /**
   * File type validation (for file uploads)
   */
  fileType?: {
    allowed?: string[];
    blocked?: string[];
  };

  /**
   * File size validation (for file uploads, in MB)
   */
  fileSize?: {
    min?: number;
    max?: number;
  };

  /**
   * Custom validation function name or expression
   */
  customValidation?: string;

  /**
   * Additional validation rules
   */
  additionalRules?: Record<string, any>;
}

/**
 * Conditional logic interface for form questions
 * 
 * Defines rules for showing/hiding questions based on responses to other questions.
 * Supports complex branching logic and multi-condition rules.
 */
export interface ConditionalLogic {
  /**
   * Unique identifier for this logic rule
   */
  id?: string;

  /**
   * Action to take when conditions are met
   */
  action: 'show' | 'hide' | 'require' | 'skip' | 'jump_to';

  /**
   * Target question ID for jump_to actions
   */
  targetQuestionId?: string;

  /**
   * Logic operator for combining multiple conditions
   */
  operator: 'and' | 'or';

  /**
   * Array of conditions that must be met
   */
  conditions: LogicCondition[];

  /**
   * Whether this logic is enabled
   */
  enabled?: boolean;

  /**
   * Description of what this logic does
   */
  description?: string;
}

/**
 * Individual condition within conditional logic
 */
export interface LogicCondition {
  /**
   * ID of the question this condition refers to
   */
  questionId: string;

  /**
   * Operator for the condition
   */
  operator: LogicOperator;

  /**
   * Value to compare against (can be string, number, or array for multi-select)
   */
  value: string | number | boolean | string[] | number[];

  /**
   * Whether this condition is case-sensitive (for text comparisons)
   */
  caseSensitive?: boolean;
}

/**
 * Question-specific settings
 */
export interface QuestionSettings {
  /**
   * For rating questions: minimum rating value
   */
  minRating?: number;

  /**
   * For rating questions: maximum rating value
   */
  maxRating?: number;

  /**
   * For rating questions: rating labels
   */
  ratingLabels?: string[];

  /**
   * For file upload: allowed file types
   */
  allowedFileTypes?: string[];

  /**
   * For file upload: maximum file size in MB
   */
  maxFileSize?: number;

  /**
   * For file upload: maximum number of files
   */
  maxFiles?: number;

  /**
   * For choice questions: whether to allow "other" option
   */
  allowOther?: boolean;

  /**
   * For choice questions: maximum selections allowed
   */
  maxSelections?: number;

  /**
   * For text inputs: maximum character count
   */
  maxLength?: number;

  /**
   * For text inputs: minimum character count
   */
  minLength?: number;

  /**
   * For date inputs: minimum date
   */
  minDate?: string;

  /**
   * For date inputs: maximum date
   */
  maxDate?: string;

  /**
   * Custom properties for specific question types
   */
  customProperties?: Record<string, any>;
} 