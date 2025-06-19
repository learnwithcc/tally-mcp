/**
 * Test Data Factory for E2E Integration Tests
 * 
 * Provides realistic test data generation for form creation and submission testing.
 * Helps ensure tests use varied, realistic data rather than static values.
 */

import { faker } from '@faker-js/faker';

export interface TestUser {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface TestFormData {
  title: string;
  description: string;
  thankYouMessage: string;
  submissionEmail: string;
}

export class TestDataFactory {
  /**
   * Generate a realistic test user profile
   */
  static generateTestUser(): TestUser {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    return {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone: faker.phone.number({ style: 'international' }),
      company: faker.company.name(),
      jobTitle: faker.person.jobTitle(),
      website: faker.internet.url(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      }
    };
  }

  /**
   * Generate realistic form metadata
   */
  static generateFormData(prefix: string = 'E2E Test'): TestFormData {
    const businessType = faker.company.buzzNoun();
    const action = faker.hacker.verb();
    
    return {
      title: `${prefix} - ${faker.company.catchPhrase()}`,
      description: `This is a ${businessType} form designed to ${action} user information for testing purposes. ${faker.lorem.sentence()}`,
      thankYouMessage: `Thank you for your submission! We appreciate your ${businessType} feedback and will ${action} your information promptly.`,
      submissionEmail: faker.internet.email({ firstName: 'test', lastName: 'admin' }).toLowerCase()
    };
  }

  /**
   * Generate realistic survey responses
   */
  static generateSurveyResponses() {
    return {
      satisfaction: faker.number.int({ min: 1, max: 5 }),
      department: faker.helpers.arrayElement(['Sales', 'Customer Support', 'Engineering', 'Billing']),
      features: faker.helpers.arrayElements([
        'User Interface',
        'Performance',
        'Security',
        'Documentation',
        'Customer Support',
        'Pricing'
      ], { min: 1, max: 3 }),
      priority: faker.helpers.arrayElement([
        'Bug Fixes',
        'New Features',
        'Performance Improvements',
        'Better Documentation',
        'Mobile Support'
      ]),
      feedback: faker.lorem.paragraph({ min: 2, max: 4 })
    };
  }

  /**
   * Generate realistic business/application form data
   */
  static generateBusinessFormData() {
    return {
      companyName: faker.company.name(),
      industry: faker.helpers.arrayElement([
        'Technology',
        'Healthcare',
        'Finance',
        'Education',
        'Retail',
        'Manufacturing',
        'Consulting'
      ]),
      employeeCount: faker.helpers.arrayElement([
        '1-10',
        '11-50',
        '51-200',
        '201-500',
        '500+'
      ]),
      annualRevenue: faker.number.int({ min: 100000, max: 50000000 }),
      projectDescription: faker.lorem.paragraphs(2),
      budget: faker.helpers.arrayElement([
        '$5,000 - $10,000',
        '$10,000 - $25,000',
        '$25,000 - $50,000',
        '$50,000 - $100,000',
        '$100,000+'
      ]),
      timeline: faker.helpers.arrayElement([
        'Less than 1 month',
        '1-3 months',
        '3-6 months',
        '6-12 months',
        'More than 1 year'
      ])
    };
  }

  /**
   * Generate realistic event registration data
   */
  static generateEventRegistrationData() {
    return {
      eventName: `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Conference 2024`,
      attendeeType: faker.helpers.arrayElement([
        'Individual',
        'Corporate',
        'Student',
        'Non-profit'
      ]),
      dietaryRestrictions: faker.helpers.arrayElements([
        'Vegetarian',
        'Vegan',
        'Gluten-free',
        'Dairy-free',
        'Nut allergy',
        'None'
      ], { min: 0, max: 2 }),
      sessionPreferences: faker.helpers.arrayElements([
        'Technical Deep Dives',
        'Business Strategy',
        'Networking Sessions',
        'Hands-on Workshops',
        'Panel Discussions'
      ], { min: 1, max: 3 }),
      accommodationNeeds: faker.lorem.sentence(),
      emergencyContact: {
        name: faker.person.fullName(),
        phone: faker.phone.number({ style: 'international' }),
        relationship: faker.helpers.arrayElement(['Spouse', 'Parent', 'Sibling', 'Friend', 'Colleague'])
      }
    };
  }

  /**
   * Generate edge case data for stress testing
   */
  static generateEdgeCaseData() {
    return {
      longText: faker.lorem.paragraphs(10),
      shortText: faker.lorem.word(),
      specialCharacters: '!@#$%^&*()_+-=[]{}|;:,.<>?`~',
      unicodeText: '测试数据 🚀 Тест données δοκιμή',
      veryLongEmail: `${'a'.repeat(50)}@${'b'.repeat(50)}.com`,
      maxLengthText: 'x'.repeat(5000),
      htmlContent: '<script>alert("test")</script><b>Bold</b>',
      sqlInjection: "'; DROP TABLE users; --",
      xssAttempt: '<img src="x" onerror="alert(1)">',
      emptySpaces: '   ',
      nullBytes: '\0\0\0',
      controlCharacters: '\n\r\t\b\f'
    };
  }

  /**
   * Generate realistic file upload test data
   */
  static generateFileUploadData() {
    return {
      validFiles: [
        { name: 'document.pdf', size: 1024 * 1024, type: 'application/pdf' },
        { name: 'image.jpg', size: 512 * 1024, type: 'image/jpeg' },
        { name: 'spreadsheet.xlsx', size: 256 * 1024, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      ],
      invalidFiles: [
        { name: 'script.exe', size: 1024, type: 'application/x-executable' },
        { name: 'large-file.zip', size: 100 * 1024 * 1024, type: 'application/zip' },
        { name: 'no-extension', size: 1024, type: 'application/octet-stream' }
      ],
      edgeCaseFiles: [
        { name: 'very-long-filename-that-exceeds-normal-limits-and-might-cause-issues.txt', size: 1024, type: 'text/plain' },
        { name: 'file with spaces.txt', size: 1024, type: 'text/plain' },
        { name: 'file-with-unicode-测试.txt', size: 1024, type: 'text/plain' }
      ]
    };
  }

  /**
   * Generate timestamp-based unique identifiers for test isolation
   */
  static generateUniqueId(prefix: string = 'test'): string {
    const timestamp = Date.now();
    const random = faker.string.alphanumeric(6);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Generate realistic form submission data based on form type
   */
  static generateFormSubmissionData(formType: 'contact' | 'survey' | 'business' | 'event' | 'minimal') {
    const baseUser = this.generateTestUser();
    
    switch (formType) {
      case 'contact':
        return {
          fullName: baseUser.fullName,
          email: baseUser.email,
          phone: baseUser.phone,
          message: faker.lorem.paragraph()
        };
        
      case 'survey':
        return {
          ...this.generateSurveyResponses(),
          email: baseUser.email
        };
        
      case 'business':
        return {
          ...baseUser,
          ...this.generateBusinessFormData()
        };
        
      case 'event':
        return {
          ...baseUser,
          ...this.generateEventRegistrationData()
        };
        
      case 'minimal':
        return {
          name: baseUser.fullName
        };
        
      default:
        return baseUser;
    }
  }

  /**
   * Generate test data for performance testing (multiple submissions)
   */
  static generateBulkTestData(count: number, formType: 'contact' | 'survey' | 'business' | 'event' | 'minimal') {
    return Array.from({ length: count }, () => this.generateFormSubmissionData(formType));
  }
} 