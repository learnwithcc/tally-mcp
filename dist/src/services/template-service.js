import { TemplateCategory, SubmissionBehavior, QuestionType, RatingStyle, } from '../models';
import { v4 as uuidv4 } from 'uuid';
const sampleTemplates = [
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
                        rules: [{ type: 'required', required: true, errorMessage: "Name is required." }]
                    }
                },
                {
                    id: 'email',
                    type: QuestionType.EMAIL,
                    label: 'Your Email',
                    required: true,
                    validation: {
                        rules: [
                            { type: 'required', required: true, errorMessage: "Email is required." },
                            { type: 'email', errorMessage: "Please enter a valid email address." }
                        ]
                    }
                },
                {
                    id: 'message',
                    type: QuestionType.TEXTAREA,
                    label: 'Your Message',
                    required: true,
                    validation: {
                        rules: [{ type: 'required', required: true, errorMessage: "Message is required." }]
                    }
                }
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
                },
                {
                    id: 'comments',
                    type: QuestionType.TEXTAREA,
                    label: 'Additional Comments',
                    required: false,
                }
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
                },
                {
                    id: 'email',
                    type: QuestionType.EMAIL,
                    label: 'Email Address',
                    required: true,
                    validation: {
                        rules: [{ type: 'email' }],
                    },
                },
                {
                    id: 'ticket_type',
                    type: QuestionType.MULTIPLE_CHOICE,
                    label: 'Ticket Type',
                    required: true,
                    options: [
                        { text: 'General Admission', value: 'general' },
                        { text: 'VIP', value: 'vip' },
                    ],
                },
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
                },
                {
                    id: 'company_email',
                    type: QuestionType.EMAIL,
                    label: 'Company Email',
                    required: true,
                    validation: {
                        rules: [{ type: 'email' }],
                    },
                },
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
                    ],
                },
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
export class TemplateService {
    constructor() {
        this.templateRegistry = sampleTemplates.reduce((registry, template) => {
            registry[template.id] = template;
            return registry;
        }, {});
    }
    getTemplates() {
        return Object.values(this.templateRegistry);
    }
    findTemplateById(templateId) {
        return this.templateRegistry[templateId];
    }
    instantiateTemplate(templateId, customTitle) {
        const template = this.findTemplateById(templateId);
        if (!template) {
            return undefined;
        }
        const formConfig = JSON.parse(JSON.stringify(template.formConfig));
        if (customTitle) {
            formConfig.title = customTitle;
        }
        return formConfig;
    }
    createTemplate(templateData) {
        const newTemplate = {
            ...templateData,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.templateRegistry[newTemplate.id] = newTemplate;
        return newTemplate;
    }
    updateTemplate(templateId, updates) {
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
    deleteTemplate(templateId) {
        if (this.templateRegistry[templateId]) {
            delete this.templateRegistry[templateId];
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=template-service.js.map