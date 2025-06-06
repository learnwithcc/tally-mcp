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
  MATRIX = 'matrix',
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

/**
 * Matrix question response types
 */
export enum MatrixResponseType {
  SINGLE_SELECT = 'single_select',
  MULTI_SELECT = 'multi_select', 
  TEXT_INPUT = 'text_input',
  RATING = 'rating',
}

/**
 * Configuration for matrix cell validation
 */
export interface MatrixCellValidation {
  /**
   * Whether this cell is required
   */
  required?: boolean | undefined;
  
  /**
   * For text input cells: minimum character count
   */
  minLength?: number | undefined;
  
  /**
   * For text input cells: maximum character count
   */
  maxLength?: number | undefined;
  
  /**
   * For rating cells: minimum rating value
   */
  minRating?: number | undefined;
  
  /**
   * For rating cells: maximum rating value
   */
  maxRating?: number | undefined;
  
  /**
   * Custom validation pattern
   */
  pattern?: string | undefined;
  
  /**
   * Custom error message
   */
  errorMessage?: string | undefined;
}

/**
 * Matrix question row definition
 */
export interface MatrixRow {
  /**
   * Unique identifier for the row
   */
  id?: string | undefined;
  
  /**
   * Display text for the row
   */
  text: string;
  
  /**
   * Optional value (defaults to text if not provided)
   */
  value?: string | undefined;
  
  /**
   * Whether this row is required
   */
  required?: boolean | undefined;
  
  /**
   * Cell-specific validation for this row
   */
  cellValidation?: MatrixCellValidation | undefined;
}

/**
 * Matrix question column definition
 */
export interface MatrixColumn {
  /**
   * Unique identifier for the column
   */
  id?: string | undefined;
  
  /**
   * Display text for the column
   */
  text: string;
  
  /**
   * Optional value (defaults to text if not provided)
   */
  value?: string | undefined;
  
  /**
   * Response type for this column
   */
  responseType?: MatrixResponseType | undefined;
  
  /**
   * For choice columns: available options
   */
  options?: QuestionOption[] | undefined;
  
  /**
   * Column width (for responsive layouts)
   */
  width?: string | undefined;
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
  description?: string | undefined;

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
  branding?: BrandingConfig | undefined;

  /**
   * Optional metadata for form organization
   */
  metadata?: FormMetadata | undefined;
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
  id?: string | undefined;

  /**
   * Display label for the question
   */
  label: string;

  /**
   * Optional description or help text for the question
   */
  description?: string | undefined;

  /**
   * Whether the question is required for form submission
   */
  required: boolean;

  /**
   * Placeholder text for input fields
   */
  placeholder?: string | undefined;

  /**
   * Validation rules for the question
   */
  validation?: ValidationRules | undefined;

  /**
   * Conditional logic rules for showing/hiding this question
   */
  logic?: ConditionalLogic | undefined;

  /**
   * Display order/position in the form
   */
  order?: number | undefined;
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
  minLength?: number | undefined;
  /**
   * Maximum character count
   */
  maxLength?: number | undefined;
  /**
   * Input format hint (e.g., 'capitalize', 'lowercase', 'uppercase')
   */
  format?: string | undefined;
}

/**
 * Textarea (long text) question configuration
 */
export interface TextareaQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.TEXTAREA;
  /**
   * Minimum character count
   */
  minLength?: number | undefined;
  /**
   * Maximum character count
   */
  maxLength?: number | undefined;
  /**
   * Number of visible rows
   */
  rows?: number | undefined;
  /**
   * Whether to auto-resize based on content
   */
  autoResize?: boolean | undefined;
}

/**
 * Email input question configuration
 */
export interface EmailQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.EMAIL;
  /**
   * Whether to validate email format
   */
  validateFormat?: boolean | undefined;
  /**
   * Whether to suggest common email domains
   */
  suggestDomains?: boolean | undefined;
}

/**
 * Phone number input question configuration
 */
export interface PhoneQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.PHONE;
  /**
   * Phone number format/pattern
   */
  format?: PhoneFormat | undefined;
  /**
   * Custom format pattern if using CUSTOM format
   */
  customPattern?: string | undefined;
  /**
   * Whether to auto-format as user types
   */
  autoFormat?: boolean | undefined;
}

/**
 * URL input question configuration
 */
export interface UrlQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.URL;
  /**
   * Whether to validate URL format
   */
  validateFormat?: boolean | undefined;
  /**
   * Whether to require specific URL schemes (e.g., ['http', 'https'])
   */
  allowedSchemes?: string[] | undefined;
}

/**
 * Number input question configuration
 */
export interface NumberQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.NUMBER;
  /**
   * Minimum allowed value
   */
  min?: number | undefined;
  /**
   * Maximum allowed value
   */
  max?: number | undefined;
  /**
   * Step value for increment/decrement
   */
  step?: number | undefined;
  /**
   * Number of decimal places allowed
   */
  decimalPlaces?: number | undefined;
  /**
   * Whether to format with thousand separators
   */
  useThousandSeparator?: boolean | undefined;
  /**
   * Currency symbol (if this is a currency input)
   */
  currency?: string | undefined;
}

/**
 * Date input question configuration
 */
export interface DateQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.DATE;
  /**
   * Minimum allowed date (ISO string)
   */
  minDate?: string | undefined;
  /**
   * Maximum allowed date (ISO string)
   */
  maxDate?: string | undefined;
  /**
   * Date format for display (e.g., 'MM/DD/YYYY', 'DD/MM/YYYY')
   */
  dateFormat?: string | undefined;
  /**
   * Whether to include time selection
   */
  includeTime?: boolean | undefined;
  /**
   * Default date value (ISO string)
   */
  defaultDate?: string | undefined;
}

/**
 * Time input question configuration
 */
export interface TimeQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.TIME;
  /**
   * Time format (12-hour or 24-hour)
   */
  format?: TimeFormat | undefined;
  /**
   * Minute step interval
   */
  minuteStep?: number | undefined;
  /**
   * Default time value (HH:MM format)
   */
  defaultTime?: string | undefined;
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
  allowOther?: boolean | undefined;
  /**
   * Whether to randomize option order
   */
  randomizeOptions?: boolean | undefined;
  /**
   * Layout style for options
   */
  layout?: QuestionLayout | undefined;
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
  allowOther?: boolean | undefined;
  /**
   * Whether to allow search/filtering of options
   */
  searchable?: boolean | undefined;
  /**
   * Placeholder text for the dropdown
   */
  dropdownPlaceholder?: string | undefined;
  /**
   * Whether to allow multiple selections
   */
  multiSelect?: boolean | undefined;
  /**
   * Maximum number of selections (for multi-select)
   */
  maxSelections?: number | undefined;
  /**
   * Minimum number of selections (for multi-select)
   */
  minSelections?: number | undefined;
  /**
   * Whether to enable image-based options
   */
  imageOptions?: boolean | undefined;
  /**
   * Advanced search configuration
   */
  searchConfig?: {
    minSearchLength?: number | undefined;
    searchPlaceholder?: string | undefined;
    highlightMatches?: boolean | undefined;
    fuzzySearch?: boolean | undefined;
  } | undefined;
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
  minSelections?: number | undefined;
  /**
   * Maximum number of allowed selections
   */
  maxSelections?: number | undefined;
  /**
   * Whether to allow "Other" option with text input
   */
  allowOther?: boolean | undefined;
  /**
   * Whether to randomize option order
   */
  randomizeOptions?: boolean | undefined;
  /**
   * Layout style for options
   */
  layout?: QuestionLayout | undefined;
  /**
   * Whether to enable image-based options
   */
  imageOptions?: boolean | undefined;
  /**
   * Advanced selection constraints
   */
  selectionConstraints?: {
    forbiddenCombinations?: string[][] | undefined;
    requiredCombinations?: string[][] | undefined;
    mutuallyExclusive?: string[][] | undefined;
  } | undefined;
  /**
   * Search and filtering options for large option sets
   */
  searchOptions?: {
    enableSearch?: boolean | undefined;
    searchPlaceholder?: string | undefined;
    minSearchLength?: number | undefined;
  } | undefined;
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
  ratingLabels?: string[] | undefined;
  /**
   * Rating display style
   */
  style?: RatingStyle | undefined;
  /**
   * Whether to show numeric values alongside icons
   */
  showNumbers?: boolean | undefined;
  /**
   * Label for low end of scale
   */
  lowLabel?: string | undefined;
  /**
   * Label for high end of scale
   */
  highLabel?: string | undefined;
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
  step?: number | undefined;
  /**
   * Label for low end of scale
   */
  lowLabel?: string | undefined;
  /**
   * Label for high end of scale
   */
  highLabel?: string | undefined;
  /**
   * Whether to show numeric values on scale
   */
  showNumbers?: boolean | undefined;
}

/**
 * File upload question configuration
 */
export interface FileQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.FILE;
  /**
   * Allowed file types (MIME types or extensions)
   */
  allowedTypes?: string[] | undefined;
  /**
   * Maximum file size in MB
   */
  maxFileSize?: number | undefined;
  /**
   * Maximum number of files allowed
   */
  maxFiles?: number | undefined;
  /**
   * Whether to allow multiple file selection
   */
  multiple?: boolean | undefined;
  /**
   * Upload area text/instructions
   */
  uploadText?: string | undefined;
  /**
   * Whether to enable drag-and-drop functionality
   */
  enableDragDrop?: boolean | undefined;
  /**
   * Hint text for drag-and-drop area
   */
  dragDropHint?: string | undefined;
  /**
   * Whether to show upload progress indicator
   */
  showProgress?: boolean | undefined;
  /**
   * Whether to show file preview thumbnails
   */
  showPreview?: boolean | undefined;
  /**
   * File type restrictions for better validation
   */
  fileRestrictions?: {
    allowedExtensions?: string[] | undefined;
    blockedExtensions?: string[] | undefined;
    allowedMimeTypes?: string[] | undefined;
    blockedMimeTypes?: string[] | undefined;
  } | undefined;
  /**
   * Upload size constraints
   */
  sizeConstraints?: {
    minFileSize?: number | undefined; // in MB
    maxTotalSize?: number | undefined; // in MB (for multiple files)
  } | undefined;
}

/**
 * Signature question configuration
 */
export interface SignatureQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.SIGNATURE;
  /**
   * Canvas width in pixels
   */
  canvasWidth?: number | undefined;
  /**
   * Canvas height in pixels
   */
  canvasHeight?: number | undefined;
  /**
   * Pen color for signature
   */
  penColor?: string | undefined;
  /**
   * Background color for signature pad
   */
  backgroundColor?: string | undefined;
}

/**
 * Matrix question configuration
 */
export interface MatrixQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.MATRIX;
  /**
   * Matrix rows (question statements)
   */
  rows: MatrixRow[];
  
  /**
   * Matrix columns (answer options/types)
   */
  columns: MatrixColumn[];
  
  /**
   * Default response type for all cells
   */
  defaultResponseType: MatrixResponseType;
  
  /**
   * Whether to allow selecting multiple options per row (for multi-select type)
   */
  allowMultiplePerRow?: boolean | undefined;
  
  /**
   * Whether to require at least one selection per row
   */
  requireAllRows?: boolean | undefined;
  
  /**
   * Whether to randomize row order
   */
  randomizeRows?: boolean | undefined;
  
  /**
   * Whether to randomize column order
   */
  randomizeColumns?: boolean | undefined;
  
  /**
   * Mobile responsive behavior
   */
  mobileLayout?: 'stacked' | 'scrollable' | 'accordion' | undefined;
  
  /**
   * Whether to show row/column headers on mobile
   */
  showHeadersOnMobile?: boolean | undefined;
  
  /**
   * Default validation for all cells
   */
  defaultCellValidation?: MatrixCellValidation | undefined;
  
  /**
   * Custom CSS classes for styling
   */
  customClasses?: {
    table?: string | undefined;
    row?: string | undefined;
    column?: string | undefined;
    cell?: string | undefined;
  } | undefined;
}

/**
 * Payment question configuration
 */
export interface PaymentQuestionConfig extends BaseQuestionConfig {
  type: QuestionType.PAYMENT;
  /**
   * Payment amount in cents
   */
  amount?: number | undefined;
  /**
   * Currency code (e.g., 'USD', 'EUR')
   */
  currency: string;
  /**
   * Whether amount is fixed or user can enter custom amount
   */
  fixedAmount?: boolean | undefined;
  /**
   * Minimum amount if allowing custom amounts
   */
  minAmount?: number | undefined;
  /**
   * Maximum amount if allowing custom amounts
   */
  maxAmount?: number | undefined;
  /**
   * Payment description
   */
  paymentDescription?: string | undefined;
  /**
   * Accepted payment methods
   */
  acceptedMethods?: PaymentMethod[] | undefined;
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
  | MatrixQuestionConfig
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
 * Type guard to check if a question is a matrix question
 */
export function isMatrixQuestion(question: QuestionConfig): question is MatrixQuestionConfig {
  return question.type === QuestionType.MATRIX;
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
  T extends QuestionType.MATRIX ? MatrixQuestionConfig :
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

// ===============================
// Validation Rule Type Guards and Utilities
// ===============================

/**
 * Type guard for required validation
 */
export function isRequiredValidation(rule: ValidationRule): rule is RequiredValidation {
  return rule.type === 'required';
}

/**
 * Type guard for length validation
 */
export function isLengthValidation(rule: ValidationRule): rule is LengthValidation {
  return rule.type === 'length';
}

/**
 * Type guard for numeric validation
 */
export function isNumericValidation(rule: ValidationRule): rule is NumericValidation {
  return rule.type === 'numeric';
}

/**
 * Type guard for pattern validation
 */
export function isPatternValidation(rule: ValidationRule): rule is PatternValidation {
  return rule.type === 'pattern';
}

/**
 * Type guard for email validation
 */
export function isEmailValidation(rule: ValidationRule): rule is EmailValidation {
  return rule.type === 'email';
}

/**
 * Type guard for URL validation
 */
export function isUrlValidation(rule: ValidationRule): rule is UrlValidation {
  return rule.type === 'url';
}

/**
 * Type guard for phone validation
 */
export function isPhoneValidation(rule: ValidationRule): rule is PhoneValidation {
  return rule.type === 'phone';
}

/**
 * Type guard for date validation
 */
export function isDateValidation(rule: ValidationRule): rule is DateValidation {
  return rule.type === 'date';
}

/**
 * Type guard for time validation
 */
export function isTimeValidation(rule: ValidationRule): rule is TimeValidation {
  return rule.type === 'time';
}

/**
 * Type guard for file validation
 */
export function isFileValidation(rule: ValidationRule): rule is FileValidation {
  return rule.type === 'file';
}

/**
 * Type guard for choice validation
 */
export function isChoiceValidation(rule: ValidationRule): rule is ChoiceValidation {
  return rule.type === 'choice';
}

/**
 * Type guard for rating validation
 */
export function isRatingValidation(rule: ValidationRule): rule is RatingValidation {
  return rule.type === 'rating';
}

/**
 * Type guard for custom validation
 */
export function isCustomValidation(rule: ValidationRule): rule is CustomValidation {
  return rule.type === 'custom';
}

/**
 * Get compatible validation rules for a specific question type
 */
export function getCompatibleValidationTypes(questionType: QuestionType): ValidationRule['type'][] {
  const baseTypes: ValidationRule['type'][] = ['required', 'custom'];

  switch (questionType) {
    case QuestionType.TEXT:
    case QuestionType.TEXTAREA:
      return [...baseTypes, 'length', 'pattern'];
    
    case QuestionType.EMAIL:
      return [...baseTypes, 'length', 'pattern', 'email'];
    
    case QuestionType.PHONE:
      return [...baseTypes, 'length', 'pattern', 'phone'];
    
    case QuestionType.URL:
      return [...baseTypes, 'length', 'pattern', 'url'];
    
    case QuestionType.NUMBER:
      return [...baseTypes, 'numeric'];
    
    case QuestionType.DATE:
      return [...baseTypes, 'date'];
    
    case QuestionType.TIME:
      return [...baseTypes, 'time'];
    
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.DROPDOWN:
    case QuestionType.CHECKBOXES:
      return [...baseTypes, 'choice'];
    
    case QuestionType.RATING:
    case QuestionType.LINEAR_SCALE:
      return [...baseTypes, 'rating', 'numeric'];
    
    case QuestionType.FILE:
    case QuestionType.SIGNATURE:
      return [...baseTypes, 'file'];
    
    case QuestionType.MATRIX:
      return [...baseTypes, 'choice'];
    
    case QuestionType.PAYMENT:
      return [...baseTypes, 'numeric'];
    
    default:
      return baseTypes;
  }
}

/**
 * Check if a validation rule is compatible with a question type
 */
export function isValidationRuleCompatible(
  rule: ValidationRule,
  questionType: QuestionType
): boolean {
  const compatibleTypes = getCompatibleValidationTypes(questionType);
  return compatibleTypes.includes(rule.type);
}

/**
 * Filter validation rules to only include compatible ones for a question type
 */
export function filterCompatibleValidationRules(
  rules: ValidationRule[],
  questionType: QuestionType
): ValidationRule[] {
  return rules.filter(rule => isValidationRuleCompatible(rule, questionType));
}

/**
 * Utility type for validation rule configurations by question type
 */
export type ValidationRulesForQuestionType<T extends QuestionType> = 
  T extends TextQuestionType ? (RequiredValidation | LengthValidation | PatternValidation | CustomValidation) :
  T extends QuestionType.EMAIL ? (RequiredValidation | LengthValidation | PatternValidation | EmailValidation | CustomValidation) :
  T extends QuestionType.PHONE ? (RequiredValidation | LengthValidation | PatternValidation | PhoneValidation | CustomValidation) :
  T extends QuestionType.URL ? (RequiredValidation | LengthValidation | PatternValidation | UrlValidation | CustomValidation) :
  T extends NumericQuestionType ? (RequiredValidation | NumericValidation | CustomValidation) :
  T extends QuestionType.DATE ? (RequiredValidation | DateValidation | CustomValidation) :
  T extends QuestionType.TIME ? (RequiredValidation | TimeValidation | CustomValidation) :
  T extends ChoiceQuestionType ? (RequiredValidation | ChoiceValidation | CustomValidation) :
  T extends QuestionType.FILE | QuestionType.SIGNATURE ? (RequiredValidation | FileValidation | CustomValidation) :
  T extends QuestionType.MATRIX ? (RequiredValidation | ChoiceValidation | CustomValidation) :
  T extends QuestionType.PAYMENT ? (RequiredValidation | NumericValidation | CustomValidation) :
  RequiredValidation | CustomValidation;

/**
 * Utility function to create typed validation rules for a specific question type
 */
export function createValidationRulesForQuestion<T extends QuestionType>(
  rules: ValidationRulesForQuestionType<T>[]
): ValidationRules {
  return {
    rules: rules as ValidationRule[],
    validateOnChange: true,
    validateOnBlur: true,
    stopOnFirstError: false,
  };
}

/**
 * Combine multiple validation rule sets
 */
export function combineValidationRules(...ruleSets: ValidationRules[]): ValidationRules {
  const combinedRules: ValidationRule[] = [];
  const combinedCustomMessages: Record<string, string> = {};
  let validateOnChange = false;
  let validateOnBlur = false;
  let stopOnFirstError = false;
  const allDependencies: string[] = [];

  for (const ruleSet of ruleSets) {
    if (ruleSet.rules) {
      combinedRules.push(...ruleSet.rules);
    }
    
    if (ruleSet.customMessages) {
      Object.assign(combinedCustomMessages, ruleSet.customMessages);
    }
    
    if (ruleSet.validateOnChange) validateOnChange = true;
    if (ruleSet.validateOnBlur) validateOnBlur = true;
    if (ruleSet.stopOnFirstError) stopOnFirstError = true;
    
    if (ruleSet.dependencies) {
      allDependencies.push(...ruleSet.dependencies);
    }
  }

  const result: ValidationRules = {
    rules: combinedRules,
    validateOnChange,
    validateOnBlur,
    stopOnFirstError,
  };

  if (Object.keys(combinedCustomMessages).length > 0) {
    result.customMessages = combinedCustomMessages as Partial<Record<ValidationRule['type'], string>>;
  }

  if (allDependencies.length > 0) {
    result.dependencies = [...new Set(allDependencies)];
  }

  return result;
}

/**
 * Helper function to create a required validation rule
 */
export function createRequiredRule(errorMessage?: string): RequiredValidation {
  const rule: RequiredValidation = {
    type: 'required',
    required: true,
  };
  
  if (errorMessage !== undefined) {
    rule.errorMessage = errorMessage;
  }
  
  return rule;
}

/**
 * Helper function to create a length validation rule
 */
export function createLengthRule(
  options: { minLength?: number; maxLength?: number; errorMessage?: string }
): LengthValidation {
  const rule: LengthValidation = {
    type: 'length',
  };
  
  if (options.minLength !== undefined) rule.minLength = options.minLength;
  if (options.maxLength !== undefined) rule.maxLength = options.maxLength;
  if (options.errorMessage !== undefined) rule.errorMessage = options.errorMessage;
  
  return rule;
}

/**
 * Helper function to create a numeric validation rule
 */
export function createNumericRule(
  options: { min?: number; max?: number; step?: number; decimalPlaces?: number; errorMessage?: string }
): NumericValidation {
  const rule: NumericValidation = {
    type: 'numeric',
  };
  
  if (options.min !== undefined) rule.min = options.min;
  if (options.max !== undefined) rule.max = options.max;
  if (options.step !== undefined) rule.step = options.step;
  if (options.decimalPlaces !== undefined) rule.decimalPlaces = options.decimalPlaces;
  if (options.errorMessage !== undefined) rule.errorMessage = options.errorMessage;
  
  return rule;
}

/**
 * Helper function to create a pattern validation rule
 */
export function createPatternRule(
  pattern: string,
  options?: { flags?: string; caseSensitive?: boolean; errorMessage?: string }
): PatternValidation {
  const rule: PatternValidation = {
    type: 'pattern',
    pattern,
  };
  
  if (options?.flags !== undefined) rule.flags = options.flags;
  if (options?.caseSensitive !== undefined) rule.caseSensitive = options.caseSensitive;
  if (options?.errorMessage !== undefined) rule.errorMessage = options.errorMessage;
  
  return rule;
}

/**
 * Helper function to create an email validation rule
 */
export function createEmailRule(
  options?: { 
    allowedDomains?: string[]; 
    blockedDomains?: string[]; 
    requireTLD?: boolean; 
    errorMessage?: string 
  }
): EmailValidation {
  const rule: EmailValidation = {
    type: 'email',
  };
  
  if (options?.allowedDomains !== undefined) rule.allowedDomains = options.allowedDomains;
  if (options?.blockedDomains !== undefined) rule.blockedDomains = options.blockedDomains;
  if (options?.requireTLD !== undefined) rule.requireTLD = options.requireTLD;
  if (options?.errorMessage !== undefined) rule.errorMessage = options.errorMessage;
  
  return rule;
}

/**
 * Helper function to create a choice validation rule
 */
export function createChoiceRule(
  options: { 
    minSelections?: number; 
    maxSelections?: number; 
    requiredOptions?: string[]; 
    forbiddenCombinations?: string[][]; 
    errorMessage?: string 
  }
): ChoiceValidation {
  const rule: ChoiceValidation = {
    type: 'choice',
  };
  
  if (options.minSelections !== undefined) rule.minSelections = options.minSelections;
  if (options.maxSelections !== undefined) rule.maxSelections = options.maxSelections;
  if (options.requiredOptions !== undefined) rule.requiredOptions = options.requiredOptions;
  if (options.forbiddenCombinations !== undefined) rule.forbiddenCombinations = options.forbiddenCombinations;
  if (options.errorMessage !== undefined) rule.errorMessage = options.errorMessage;
  
  return rule;
}

// =======================================
// Conditional Logic Type Guards & Utils
// =======================================

/**
 * Type guard to check if an action is a show/hide action
 */
export function isShowHideAction(action: ConditionalActionConfig): action is ShowHideAction {
  return action.action === ConditionalAction.SHOW || action.action === ConditionalAction.HIDE;
}

/**
 * Type guard to check if an action is a require action
 */
export function isRequireAction(action: ConditionalActionConfig): action is RequireAction {
  return action.action === ConditionalAction.REQUIRE || action.action === ConditionalAction.MAKE_OPTIONAL;
}

/**
 * Type guard to check if an action is a jump to action
 */
export function isJumpToAction(action: ConditionalActionConfig): action is JumpToAction {
  return action.action === ConditionalAction.JUMP_TO;
}

/**
 * Type guard to check if an action is a jump to page action
 */
export function isJumpToPageAction(action: ConditionalActionConfig): action is JumpToPageAction {
  return action.action === ConditionalAction.JUMP_TO_PAGE;
}

/**
 * Type guard to check if an action is a set value action
 */
export function isSetValueAction(action: ConditionalActionConfig): action is SetValueAction {
  return action.action === ConditionalAction.SET_VALUE;
}

/**
 * Type guard to check if an action is a clear value action
 */
export function isClearValueAction(action: ConditionalActionConfig): action is ClearValueAction {
  return action.action === ConditionalAction.CLEAR_VALUE;
}

/**
 * Type guard to check if an action is an enable/disable action
 */
export function isEnableDisableAction(action: ConditionalActionConfig): action is EnableDisableAction {
  return action.action === ConditionalAction.ENABLE || action.action === ConditionalAction.DISABLE;
}

/**
 * Type guard to check if an action is a show message action
 */
export function isShowMessageAction(action: ConditionalActionConfig): action is ShowMessageAction {
  return action.action === ConditionalAction.SHOW_MESSAGE;
}

/**
 * Type guard to check if an action is a redirect action
 */
export function isRedirectAction(action: ConditionalActionConfig): action is RedirectAction {
  return action.action === ConditionalAction.REDIRECT;
}

/**
 * Type guard to check if an action is a submit form action
 */
export function isSubmitFormAction(action: ConditionalActionConfig): action is SubmitFormAction {
  return action.action === ConditionalAction.SUBMIT_FORM;
}

/**
 * Type guard to check if an action is a skip action
 */
export function isSkipAction(action: ConditionalActionConfig): action is SkipAction {
  return action.action === ConditionalAction.SKIP;
}

/**
 * Get all question IDs referenced in a conditional logic rule
 */
export function getReferencedQuestionIds(logic: ConditionalLogic): string[] {
  const questionIds = new Set<string>();

  function processConditionGroup(group: LogicConditionGroup): void {
    group.conditions.forEach(condition => {
      questionIds.add(condition.questionId);
    });
    
    group.groups?.forEach(nestedGroup => {
      processConditionGroup(nestedGroup);
    });
  }

  function processActions(actions: ConditionalActionConfig[]): void {
    actions.forEach(action => {
      if (isJumpToAction(action)) {
        questionIds.add(action.targetQuestionId);
      } else if (isSetValueAction(action) || isClearValueAction(action)) {
        questionIds.add(action.targetQuestionId);
      }
    });
  }

  processConditionGroup(logic.conditionGroup);
  processActions(logic.actions);
  if (logic.elseActions) {
    processActions(logic.elseActions);
  }

  return Array.from(questionIds);
}

/**
 * Check if a conditional logic rule references a specific question
 */
export function logicReferencesQuestion(logic: ConditionalLogic, questionId: string): boolean {
  return getReferencedQuestionIds(logic).includes(questionId);
}

/**
 * Validate that all referenced questions exist in the form
 */
export function validateLogicReferences(
  logic: ConditionalLogic, 
  existingQuestionIds: string[]
): { isValid: boolean; missingQuestions: string[] } {
  const referencedIds = getReferencedQuestionIds(logic);
  const missingQuestions = referencedIds.filter(id => !existingQuestionIds.includes(id));
  
  return {
    isValid: missingQuestions.length === 0,
    missingQuestions
  };
}

/**
 * Create a simple show/hide conditional logic rule
 */
export function createSimpleShowHideLogic(
  questionId: string,
  triggerQuestionId: string,
  operator: LogicOperator,
  value: any,
  action: 'show' | 'hide' = 'show'
): ConditionalLogic {
  return {
    id: `${action}_${questionId}_when_${triggerQuestionId}_${operator}_${value}`,
    name: `${action === 'show' ? 'Show' : 'Hide'} ${questionId} when ${triggerQuestionId} ${operator} ${value}`,
    enabled: true,
    conditionGroup: {
      combinator: LogicCombinator.AND,
      conditions: [
        {
          questionId: triggerQuestionId,
          operator,
          value
        }
      ]
    },
    actions: [
      {
        action: action === 'show' ? ConditionalAction.SHOW : ConditionalAction.HIDE
      } as ShowHideAction
    ]
  };
}

/**
 * Create a conditional logic rule for making questions required
 */
export function createRequiredLogic(
  questionId: string,
  triggerQuestionId: string,
  operator: LogicOperator,
  value: any,
  validationMessage?: string
): ConditionalLogic {
  return {
    id: `require_${questionId}_when_${triggerQuestionId}_${operator}_${value}`,
    name: `Require ${questionId} when ${triggerQuestionId} ${operator} ${value}`,
    enabled: true,
    conditionGroup: {
      combinator: LogicCombinator.AND,
      conditions: [
        {
          questionId: triggerQuestionId,
          operator,
          value
        }
      ]
    },
    actions: [
      {
        action: ConditionalAction.REQUIRE,
        validationMessage
      } as RequireAction
    ]
  };
}

/**
 * Create a jump logic rule
 */
export function createJumpLogic(
  triggerQuestionId: string,
  operator: LogicOperator,
  value: any,
  targetQuestionId: string,
  skipValidation: boolean = false
): ConditionalLogic {
  return {
    id: `jump_to_${targetQuestionId}_when_${triggerQuestionId}_${operator}_${value}`,
    name: `Jump to ${targetQuestionId} when ${triggerQuestionId} ${operator} ${value}`,
    enabled: true,
    conditionGroup: {
      combinator: LogicCombinator.AND,
      conditions: [
        {
          questionId: triggerQuestionId,
          operator,
          value
        }
      ]
    },
    actions: [
      {
        action: ConditionalAction.JUMP_TO,
        targetQuestionId,
        skipValidation
      } as JumpToAction
    ]
  };
}

/**
 * Utility type for actions that target specific questions
 */
export type QuestionTargetingAction = JumpToAction | SetValueAction | ClearValueAction;

/**
 * Utility type for actions that affect question behavior
 */
export type QuestionBehaviorAction = ShowHideAction | RequireAction | EnableDisableAction;

/**
 * Utility type for actions that affect form flow
 */
export type FormFlowAction = JumpToAction | JumpToPageAction | SubmitFormAction | SkipAction;

/**
 * Utility type for actions that provide user feedback
 */
export type FeedbackAction = ShowMessageAction | RedirectAction;

/**
 * Form-level settings and behavior configuration
 */
export interface FormSettings {
  /**
   * Whether to show a progress bar
   */
  showProgressBar?: boolean | undefined;

  /**
   * Whether to allow saving drafts
   */
  allowDrafts?: boolean | undefined;

  /**
   * Whether to show question numbers
   */
  showQuestionNumbers?: boolean | undefined;

  /**
   * Whether to shuffle question order
   */
  shuffleQuestions?: boolean | undefined;

  /**
   * Maximum number of submissions allowed
   */
  maxSubmissions?: number | undefined;

  /**
   * Whether to require authentication
   */
  requireAuth?: boolean | undefined;

  /**
   * Whether to collect respondent email
   */
  collectEmail?: boolean | undefined;

  /**
   * Form closing date (ISO string)
   */
  closeDate?: string | undefined;

  /**
   * Form opening date (ISO string)
   */
  openDate?: string | undefined;

  /**
   * Behavior after form submission
   */
  submissionBehavior: SubmissionBehavior;

  /**
   * Custom message or URL for after submission
   */
  submissionMessage?: string | undefined;

  /**
   * Redirect URL after submission (if using REDIRECT behavior)
   */
  redirectUrl?: string | undefined;

  /**
   * Whether to send confirmation emails
   */
  sendConfirmationEmail?: boolean | undefined;

  /**
   * Whether to allow multiple submissions from same user
   */
  allowMultipleSubmissions?: boolean | undefined;
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
  primaryColor?: string | undefined;

  /**
   * Secondary brand color (hex code)
   */
  secondaryColor?: string | undefined;

  /**
   * Background color or image URL
   */
  background?: string | undefined;

  /**
   * Custom CSS styles
   */
  customCss?: string | undefined;

  /**
   * Logo image URL
   */
  logoUrl?: string | undefined;

  /**
   * Font family name
   */
  fontFamily?: string | undefined;

  /**
   * Button style customization
   */
  buttonStyle?: ButtonStyle | undefined;
}

/**
 * Form metadata for organization and management
 */
export interface FormMetadata {
  /**
   * Tags for categorizing the form
   */
  tags?: string[] | undefined;

  /**
   * Category or folder for organization
   */
  category?: string | undefined;

  /**
   * Form creation timestamp
   */
  createdAt?: string | undefined;

  /**
   * Last modification timestamp
   */
  updatedAt?: string | undefined;

  /**
   * Form creator/owner identifier
   */
  createdBy?: string | undefined;

  /**
   * Workspace or organization identifier
   */
  workspaceId?: string | undefined;

  /**
   * Whether the form is published/public
   */
  isPublished?: boolean | undefined;

  /**
   * Whether the form is archived
   */
  isArchived?: boolean | undefined;

  /**
   * Form version number
   */
  version?: number | undefined;
}

/**
 * Button styling configuration
 */
export interface ButtonStyle {
  /**
   * Button background color
   */
  backgroundColor?: string | undefined;

  /**
   * Button text color
   */
  textColor?: string | undefined;

  /**
   * Button border radius
   */
  borderRadius?: number | undefined;

  /**
   * Button border style
   */
  border?: string | undefined;

  /**
   * Button font size
   */
  fontSize?: number | undefined;

  /**
   * Button padding
   */
  padding?: string | undefined;
}

/**
 * Option for choice-based questions
 */
export interface QuestionOption {
  /**
   * Unique identifier for the option
   */
  id?: string | undefined;

  /**
   * Display text for the option
   */
  text: string;

  /**
   * Optional value (defaults to text if not provided)
   */
  value?: string | undefined;

  /**
   * Whether this option is selected by default
   */
  isDefault?: boolean | undefined;

  /**
   * Optional image URL for the option
   */
  imageUrl?: string | undefined;

  /**
   * Additional metadata for the option
   */
  metadata?: Record<string, any> | undefined;
}

// ===============================
// Validation Rules and Types
// ===============================

/**
 * Base validation rule interface
 */
export interface BaseValidationRule {
  /**
   * Custom error message for this validation rule
   */
  errorMessage?: string | undefined;

  /**
   * Whether this validation rule is enabled
   */
  enabled?: boolean | undefined;
}

/**
 * Required field validation
 */
export interface RequiredValidation extends BaseValidationRule {
  type: 'required';
  required: true;
}

/**
 * Text length validation
 */
export interface LengthValidation extends BaseValidationRule {
  type: 'length';
  minLength?: number | undefined;
  maxLength?: number | undefined;
}

/**
 * Numeric range validation
 */
export interface NumericValidation extends BaseValidationRule {
  type: 'numeric';
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  decimalPlaces?: number | undefined;
}

/**
 * Pattern matching validation
 */
export interface PatternValidation extends BaseValidationRule {
  type: 'pattern';
  pattern: string;
  flags?: string | undefined;
  caseSensitive?: boolean | undefined;
}

/**
 * Email format validation
 */
export interface EmailValidation extends BaseValidationRule {
  type: 'email';
  allowedDomains?: string[] | undefined;
  blockedDomains?: string[] | undefined;
  requireTLD?: boolean | undefined;
}

/**
 * URL format validation
 */
export interface UrlValidation extends BaseValidationRule {
  type: 'url';
  allowedSchemes?: string[] | undefined;
  requireScheme?: boolean | undefined;
  allowedDomains?: string[] | undefined;
}

/**
 * Phone number format validation
 */
export interface PhoneValidation extends BaseValidationRule {
  type: 'phone';
  format?: PhoneFormat | undefined;
  country?: string | undefined;
  allowInternational?: boolean | undefined;
}

/**
 * Date range validation
 */
export interface DateValidation extends BaseValidationRule {
  type: 'date';
  minDate?: string | undefined;
  maxDate?: string | undefined;
  allowPast?: boolean | undefined;
  allowFuture?: boolean | undefined;
  excludeDates?: string[] | undefined;
  excludeWeekends?: boolean | undefined;
}

/**
 * Time validation
 */
export interface TimeValidation extends BaseValidationRule {
  type: 'time';
  minTime?: string | undefined;
  maxTime?: string | undefined;
  allowedTimeSlots?: Array<{ start: string; end: string }> | undefined;
  excludeTimeSlots?: Array<{ start: string; end: string }> | undefined;
}

/**
 * File upload validation
 */
export interface FileValidation extends BaseValidationRule {
  type: 'file';
  allowedTypes?: string[] | undefined;
  blockedTypes?: string[] | undefined;
  maxFileSize?: number | undefined; // in MB
  minFileSize?: number | undefined; // in MB
  maxFiles?: number | undefined;
  minFiles?: number | undefined;
  allowedExtensions?: string[] | undefined;
  blockedExtensions?: string[] | undefined;
}

/**
 * Choice/option validation
 */
export interface ChoiceValidation extends BaseValidationRule {
  type: 'choice';
  minSelections?: number | undefined;
  maxSelections?: number | undefined;
  requiredOptions?: string[] | undefined;
  forbiddenCombinations?: string[][] | undefined;
}

/**
 * Rating validation
 */
export interface RatingValidation extends BaseValidationRule {
  type: 'rating';
  minRating?: number | undefined;
  maxRating?: number | undefined;
  requiredRating?: boolean | undefined;
}

/**
 * Custom validation with function
 */
export interface CustomValidation extends BaseValidationRule {
  type: 'custom';
  validator: string | ((value: any, context?: any) => boolean | string);
  async?: boolean | undefined;
  dependencies?: string[] | undefined; // question IDs this validation depends on
}

/**
 * Union type of all validation rules
 */
export type ValidationRule = 
  | RequiredValidation
  | LengthValidation
  | NumericValidation
  | PatternValidation
  | EmailValidation
  | UrlValidation
  | PhoneValidation
  | DateValidation
  | TimeValidation
  | FileValidation
  | ChoiceValidation
  | RatingValidation
  | CustomValidation;

/**
 * Enhanced validation rules interface for form questions
 * 
 * Defines validation constraints that can be applied to form questions
 * to ensure data quality and compliance with business rules.
 */
export interface ValidationRules {
  /**
   * Array of validation rules to apply
   */
  rules?: ValidationRule[] | undefined;

  /**
   * Whether to validate on every change (real-time) or only on submit
   */
  validateOnChange?: boolean | undefined;

  /**
   * Whether to validate on blur (when field loses focus)
   */
  validateOnBlur?: boolean | undefined;

  /**
   * Whether to stop validation on first error
   */
  stopOnFirstError?: boolean | undefined;

  /**
   * Custom validation messages by rule type
   */
  customMessages?: Partial<Record<ValidationRule['type'], string>> | undefined;

  /**
   * Dependencies for cross-field validation
   */
  dependencies?: string[] | undefined;

  /**
   * Legacy validation properties for backward compatibility
   */
  required?: boolean | undefined;
  minLength?: number | undefined;
  maxLength?: number | undefined;
  minValue?: number | undefined;
  maxValue?: number | undefined;
  pattern?: string | undefined;
  errorMessage?: string | undefined;
  emailFormat?: boolean | undefined;
  urlFormat?: boolean | undefined;
  phoneFormat?: boolean | undefined;
  dateRange?: {
    min?: string | undefined;
    max?: string | undefined;
  } | undefined;
  fileType?: {
    allowed?: string[] | undefined;
    blocked?: string[] | undefined;
  } | undefined;
  fileSize?: {
    min?: number | undefined;
    max?: number | undefined;
  } | undefined;
  customValidation?: string | undefined;
  additionalRules?: Record<string, any> | undefined;
}

// ===============================
// Conditional Logic and Branching
// ===============================

/**
 * Action types for conditional logic
 */
export enum ConditionalAction {
  SHOW = 'show',
  HIDE = 'hide',
  REQUIRE = 'require',
  MAKE_OPTIONAL = 'make_optional',
  SKIP = 'skip',
  JUMP_TO = 'jump_to',
  JUMP_TO_PAGE = 'jump_to_page',
  SUBMIT_FORM = 'submit_form',
  SET_VALUE = 'set_value',
  CLEAR_VALUE = 'clear_value',
  DISABLE = 'disable',
  ENABLE = 'enable',
  SHOW_MESSAGE = 'show_message',
  REDIRECT = 'redirect',
}

/**
 * Logic combination operators
 */
export enum LogicCombinator {
  AND = 'and',
  OR = 'or',
  XOR = 'xor',
  NAND = 'nand',
  NOR = 'nor',
}

/**
 * Base conditional action interface
 */
export interface BaseConditionalAction {
  /**
   * Type of action to perform
   */
  action: ConditionalAction;

  /**
   * Whether this action is enabled
   */
  enabled?: boolean | undefined;

  /**
   * Optional delay before executing action (in milliseconds)
   */
  delay?: number | undefined;
}

/**
 * Show/hide action for questions
 */
export interface ShowHideAction extends BaseConditionalAction {
  action: ConditionalAction.SHOW | ConditionalAction.HIDE;
  /**
   * Animation effect for showing/hiding
   */
  animation?: 'fade' | 'slide' | 'none' | undefined;
  /**
   * Animation duration in milliseconds
   */
  animationDuration?: number | undefined;
}

/**
 * Require/optional action for questions
 */
export interface RequireAction extends BaseConditionalAction {
  action: ConditionalAction.REQUIRE | ConditionalAction.MAKE_OPTIONAL;
  /**
   * Custom validation message when making required
   */
  validationMessage?: string | undefined;
}

/**
 * Jump to question action
 */
export interface JumpToAction extends BaseConditionalAction {
  action: ConditionalAction.JUMP_TO;
  /**
   * Target question ID to jump to
   */
  targetQuestionId: string;
  /**
   * Whether to skip validation of questions before the jump
   */
  skipValidation?: boolean | undefined;
}

/**
 * Jump to page action (for multi-page forms)
 */
export interface JumpToPageAction extends BaseConditionalAction {
  action: ConditionalAction.JUMP_TO_PAGE;
  /**
   * Target page ID or page number
   */
  targetPage: string | number;
  /**
   * Whether to skip validation of current page
   */
  skipValidation?: boolean | undefined;
}

/**
 * Set value action
 */
export interface SetValueAction extends BaseConditionalAction {
  action: ConditionalAction.SET_VALUE;
  /**
   * Target question ID to set value for
   */
  targetQuestionId: string;
  /**
   * Value to set (type depends on target question type)
   */
  value: any;
  /**
   * Whether to trigger validation after setting value
   */
  triggerValidation?: boolean | undefined;
}

/**
 * Clear value action
 */
export interface ClearValueAction extends BaseConditionalAction {
  action: ConditionalAction.CLEAR_VALUE;
  /**
   * Target question ID to clear
   */
  targetQuestionId: string;
  /**
   * Whether to trigger validation after clearing
   */
  triggerValidation?: boolean | undefined;
}

/**
 * Enable/disable action
 */
export interface EnableDisableAction extends BaseConditionalAction {
  action: ConditionalAction.ENABLE | ConditionalAction.DISABLE;
  /**
   * Visual state when disabled
   */
  disabledStyle?: 'grayed_out' | 'hidden' | 'readonly' | undefined;
}

/**
 * Show message action
 */
export interface ShowMessageAction extends BaseConditionalAction {
  action: ConditionalAction.SHOW_MESSAGE;
  /**
   * Message to display
   */
  message: string;
  /**
   * Message type/style
   */
  messageType?: 'info' | 'warning' | 'error' | 'success' | undefined;
  /**
   * How long to show message (in milliseconds, 0 = permanent until condition changes)
   */
  duration?: number | undefined;
  /**
   * Position to show message
   */
  position?: 'above' | 'below' | 'inline' | 'popup' | undefined;
}

/**
 * Redirect action
 */
export interface RedirectAction extends BaseConditionalAction {
  action: ConditionalAction.REDIRECT;
  /**
   * URL to redirect to
   */
  url: string;
  /**
   * Whether to open in new window/tab
   */
  newWindow?: boolean | undefined;
  /**
   * Confirmation message before redirect
   */
  confirmationMessage?: string | undefined;
}

/**
 * Submit form action
 */
export interface SubmitFormAction extends BaseConditionalAction {
  action: ConditionalAction.SUBMIT_FORM;
  /**
   * Whether to validate form before submitting
   */
  validateBeforeSubmit?: boolean | undefined;
  /**
   * Custom submission endpoint (overrides form's default)
   */
  customEndpoint?: string | undefined;
}

/**
 * Skip action (continue to next question)
 */
export interface SkipAction extends BaseConditionalAction {
  action: ConditionalAction.SKIP;
  /**
   * Number of questions to skip (default 1)
   */
  skipCount?: number | undefined;
}

/**
 * Union type of all conditional actions
 */
export type ConditionalActionConfig = 
  | ShowHideAction
  | RequireAction
  | JumpToAction
  | JumpToPageAction
  | SetValueAction
  | ClearValueAction
  | EnableDisableAction
  | ShowMessageAction
  | RedirectAction
  | SubmitFormAction
  | SkipAction;

/**
 * Individual condition within conditional logic
 */
export interface LogicCondition {
  /**
   * Unique identifier for this condition
   */
  id?: string | undefined;

  /**
   * ID of the question this condition refers to
   */
  questionId: string;

  /**
   * Operator for the condition
   */
  operator: LogicOperator;

  /**
   * Value to compare against (type depends on target question type and operator)
   */
  value: any;

  /**
   * Whether this condition is case-sensitive (for text comparisons)
   */
  caseSensitive?: boolean | undefined;

  /**
   * Whether to negate this condition (NOT)
   */
  negate?: boolean | undefined;

  /**
   * Custom error message if condition validation fails
   */
  errorMessage?: string | undefined;
}

/**
 * Group of conditions with a combinator
 */
export interface LogicConditionGroup {
  /**
   * Unique identifier for this condition group
   */
  id?: string | undefined;

  /**
   * Combinator for this group's conditions
   */
  combinator: LogicCombinator;

  /**
   * Conditions in this group
   */
  conditions: LogicCondition[];

  /**
   * Nested condition groups (for complex logic)
   */
  groups?: LogicConditionGroup[] | undefined;

  /**
   * Whether to negate the entire group result
   */
  negate?: boolean | undefined;
}

/**
 * Enhanced conditional logic interface for form questions
 * 
 * Defines rules for showing/hiding questions, jumping between sections,
 * and performing actions based on user responses. Supports complex
 * branching logic with nested conditions and multiple actions.
 */
export interface ConditionalLogic {
  /**
   * Unique identifier for this logic rule
   */
  id?: string | undefined;

  /**
   * Name/title for this logic rule (for management/debugging)
   */
  name?: string | undefined;

  /**
   * Description of what this logic does
   */
  description?: string | undefined;

  /**
   * Whether this logic rule is enabled
   */
  enabled?: boolean | undefined;

  /**
   * Priority/order of execution (lower numbers execute first)
   */
  priority?: number | undefined;

  /**
   * Root condition group
   */
  conditionGroup: LogicConditionGroup;

  /**
   * Actions to perform when conditions are met
   */
  actions: ConditionalActionConfig[];

  /**
   * Actions to perform when conditions are NOT met (optional)
   */
  elseActions?: ConditionalActionConfig[] | undefined;

  /**
   * Whether to re-evaluate this logic when any form value changes
   */
  reEvaluateOnChange?: boolean | undefined;

  /**
   * Specific question IDs that trigger re-evaluation (if not reEvaluateOnChange)
   */
  triggerQuestions?: string[] | undefined;

  /**
   * Whether this logic should only run once per form session
   */
  runOnce?: boolean | undefined;

  /**
   * Metadata for this logic rule
   */
  metadata?: {
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    createdBy?: string | undefined;
    version?: number | undefined;
    tags?: string[] | undefined;
  } | undefined;
}

/**
 * Question-specific settings
 */
export interface QuestionSettings {
  /**
   * For rating questions: minimum rating value
   */
  minRating?: number | undefined;

  /**
   * For rating questions: maximum rating value
   */
  maxRating?: number | undefined;

  /**
   * For rating questions: rating labels
   */
  ratingLabels?: string[] | undefined;

  /**
   * For file upload: allowed file types
   */
  allowedFileTypes?: string[] | undefined;

  /**
   * For file upload: maximum file size in MB
   */
  maxFileSize?: number | undefined;

  /**
   * For file upload: maximum number of files
   */
  maxFiles?: number | undefined;

  /**
   * For choice questions: whether to allow "other" option
   */
  allowOther?: boolean | undefined;

  /**
   * For choice questions: maximum selections allowed
   */
  maxSelections?: number | undefined;

  /**
   * For text inputs: maximum character count
   */
  maxLength?: number | undefined;

  /**
   * For text inputs: minimum character count
   */
  minLength?: number | undefined;

  /**
   * For date inputs: minimum date
   */
  minDate?: string | undefined;

  /**
   * For date inputs: maximum date
   */
  maxDate?: string | undefined;

  /**
   * Custom properties for specific question types
   */
  customProperties?: Record<string, any> | undefined;
} 