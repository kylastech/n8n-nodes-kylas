/**
 * Test script to verify custom field type validation and mapping
 */

// Import the field type mapping and validation functions
const { FIELD_TYPE_MAPPING, isValidFieldType } = require('./dist/nodes/Kylas/resources/lead/customFields');

console.log('Testing Custom Field Type Validation and Mapping\n');

// Test 1: Valid field types
console.log('1. Testing valid field types:');
const validTypes = ['TEXT_FIELD', 'NUMBER', 'DATE_FIELD', 'BOOLEAN_TOGGLE', 'PICK_LIST','CHECKBOX','DATETIME_PICKER','DATE_PICKER'];
validTypes.forEach(type => {
    const isValid = isValidFieldType(type);
    const mapping = FIELD_TYPE_MAPPING[type];
    console.log(`  ${type}: ${isValid ? '✓' : '✗'} Valid, n8n type: ${mapping?.n8nType}, default: ${mapping?.defaultValue}`);
});

// Test 2: Invalid field types
const invalidTypes = ['INVALID_FIELD', 'UNKNOWN_TYPE', ''];
invalidTypes.forEach(type => {
    const isValid = isValidFieldType(type);
    console.log(`  ${type}: ${isValid ? '✓' : '✗'} Valid`);
});

// Test 3: Field metadata parsing simulation
const sampleFieldMetadata = [
    {
        name: 'companySize',
        type: 'NUMBER_FIELD',
        required: false,
        picklist: null
    },
    {
        name: 'department',
        type: 'TEXT_FIELD',
        required: true,
        picklist: null
    },
    {
        name: 'leadSource',
        type: 'PICKLIST',
        required: false,
        picklist: { id: 123 }
    },
    {
        name: 'isVip',
        type: 'BOOLEAN_FIELD',
        required: false,
        picklist: null
    }
];

sampleFieldMetadata.forEach(field => {
    const isValid = isValidFieldType(field.type);
    const mapping = FIELD_TYPE_MAPPING[field.type];
    console.log(`  Field: ${field.name} (${field.type})`);
    console.log(`    Valid: ${isValid ? '✓' : '✗'}`);
    console.log(`    n8n Type: ${mapping?.n8nType}`);
    console.log(`    Required: ${field.required}`);
    console.log(`    Has Picklist: ${field.picklist ? '✓' : '✗'}`);
    console.log('');
});

// Test 4: Simulate field value processing
console.log('4. Testing field value processing simulation:');
const sampleCustomFields = [
    {
        fieldName: JSON.stringify({ name: 'companySize', type: 'NUMBER_FIELD' }),
        numberValue: 500
    },
    {
        fieldName: JSON.stringify({ name: 'department', type: 'TEXT_FIELD' }),
        textValue: 'Sales'
    },
    {
        fieldName: JSON.stringify({ name: 'isVip', type: 'BOOLEAN_FIELD' }),
        booleanValue: true
    }
];

const processedFields = {};
sampleCustomFields.forEach(field => {
    try {
        const fieldMetadata = JSON.parse(field.fieldName);
        const fieldName = fieldMetadata.name;
        const fieldType = fieldMetadata.type;
        
        if (!isValidFieldType(fieldType)) {
            console.log(`  ✗ Invalid field type: ${fieldType}`);
            return;
        }
        
        let value = null;
        switch (fieldType) {
            case 'TEXT_FIELD':
            case 'EMAIL_FIELD':
            case 'URL_FIELD':
            case 'TEXTAREA_FIELD':
            case 'PHONE_FIELD':
                value = field.textValue;
                break;
            case 'NUMBER_FIELD':
            case 'CURRENCY_FIELD':
                value = field.numberValue;
                break;
            case 'DATE_FIELD':
                value = field.dateValue;
                break;
            case 'BOOLEAN_FIELD':
                value = field.booleanValue;
                break;
            case 'PICKLIST':
                value = field.picklistValue;
                break;
        }
        
        if (value !== undefined && value !== '' && value !== null) {
            processedFields[fieldName] = value;
            console.log(`  ✓ ${fieldName} (${fieldType}): ${value}`);
        }
    } catch (error) {
        console.log(`  ✗ Error processing field: ${error.message}`);
    }
});

console.log('\nFinal processed fields object:');
console.log(JSON.stringify(processedFields, null, 2));

console.log('\n✓ All tests completed!');
