import type { INodeProperties } from 'n8n-workflow';

const showOnlyForLeadUpdate = {
    operation: ['update'],
    resource: ['lead'],
};

export const customFieldsUpdateDescription: INodeProperties[] = [
    {
        displayName: "Custom Fields",
        name: "customFields",
        type: "fixedCollection",
        placeholder: "Add Custom Field",
        default: {},
        displayOptions: {
            show: showOnlyForLeadUpdate,
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
                        name: "fieldName",
                        type: "options",
                        typeOptions: {
                            loadOptionsMethod: 'getAvailableCustomFields',
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
