import type { INodeProperties } from 'n8n-workflow';

const showOnlyForLeadCreate = {
    operation: ['create'],
    resource: ['lead'],
};

// Field type mapping for validation and defaults
export const FIELD_TYPE_MAPPING = {
    'TEXT_FIELD': { n8nType: 'string', defaultValue: '' },
    'NUMBER': { n8nType: 'number', defaultValue: 0 },
    'DATE_PICKER': { n8nType: 'date', defaultValue: '' },
    'DATETIME_PICKER': { n8nType: 'dateTime', defaultValue: '' },
    'PICK_LIST': { n8nType: 'options', defaultValue: '' },
    'MULTI_PICKLIST': { n8nType: 'options', defaultValue: '' },
    'URL': { n8nType: 'string', defaultValue: '' },
    'TOGGLE': { n8nType: 'boolean', defaultValue: false },
    'CHECKBOX': { n8nType: 'boolean', defaultValue: false },
} as const;

// Valid field types for validation
export const VALID_FIELD_TYPES = Object.keys(FIELD_TYPE_MAPPING) as Array<keyof typeof FIELD_TYPE_MAPPING>;

// Function to validate field type
export function isValidFieldType(fieldType: string): fieldType is keyof typeof FIELD_TYPE_MAPPING {
    return VALID_FIELD_TYPES.includes(fieldType as keyof typeof FIELD_TYPE_MAPPING);
}

export const customFieldsDescription: INodeProperties[] = [
    {
        displayName: "Custom Fields",
        name: "customFields",
        type: "fixedCollection",
        placeholder: "Add Custom Field",
        default: {},
        displayOptions: {
            show: showOnlyForLeadCreate,
        },
        description: "Add custom fields for the lead. The input type will automatically adjust based on the field type.",
        typeOptions: {
            multipleValues: true,
        },
        options: [
            {
                displayName: "Custom Field",
                name: "customField",
                values: [
                    {
                        displayName: 'Field Name or ID',
                        name: "name",
                        type: "options",
                        typeOptions: {
                            loadOptionsMethod: 'getLeadCustomFields',
                            loadOptionsDependsOn: ['customFields.customField'],
                        },
                        default: '',
                        description: 'Choose a custom field from the list. Each field can only be selected once. The field type will be shown in parentheses. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
                    },
                    // Generic value field that shows for all field types
                    {
                        displayName: "Field Value",
                        name: "value",
                        type: "string",
                        default: '',
                        description: 'Enter the value for this custom field',
                    },
                ]
            },
        ],
    },
];
