const { FormModificationOperations } = require('./src/services/form-modification-operations');
const { ModificationOperation, QuestionType } = require('./src/models');

// Test creating a matrix question
const formOperations = new FormModificationOperations();

const sampleFormConfig = {
  title: 'Test Form',
  description: 'A test form',
  questions: [],
  settings: {
    submissionBehavior: 'MESSAGE'
  }
};

const command = {
  operation: ModificationOperation.ADD_FIELD,
  parameters: {
    fieldType: QuestionType.MATRIX,
    fieldLabel: 'Satisfaction Matrix',
    description: 'Rate your satisfaction with our services'
  }
};

try {
  const result = formOperations.executeOperation(command, null, sampleFormConfig);
  
  console.log('Matrix question creation result:');
  console.log('Success:', result.success);
  console.log('Message:', result.message);
  
  if (result.success && result.modifiedFormConfig) {
    const matrixQuestion = result.modifiedFormConfig.questions[0];
    console.log('\nMatrix question details:');
    console.log('Type:', matrixQuestion.type);
    console.log('Label:', matrixQuestion.label);
    console.log('Rows:', matrixQuestion.rows?.length || 0);
    console.log('Columns:', matrixQuestion.columns?.length || 0);
    console.log('Default response type:', matrixQuestion.defaultResponseType);
    console.log('Mobile layout configured:', !!matrixQuestion.mobileLayout);
    console.log('Validation configured:', !!matrixQuestion.validation);
    console.log('Randomization configured:', !!matrixQuestion.randomization);
  }
  
  if (result.errors) {
    console.log('Errors:', result.errors);
  }
} catch (error) {
  console.error('Error testing matrix question:', error.message);
} 