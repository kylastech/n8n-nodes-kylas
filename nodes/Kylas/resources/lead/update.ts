import type { INodeProperties } from 'n8n-workflow';

const showOnlyForLeadUpdate = {
    operation: ['update'],
    resource: ['lead'],
};

export const leadUpdateDescription: INodeProperties[] = [
    {
        displayName: "Lead ID",
        name: "leadId",
        description: 'ID of the lead to update',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
            show: showOnlyForLeadUpdate,
        },
    },
    {
        displayName: "Update Fields",
        name: "updateFields",
        type: "collection",
        placeholder: "Add Field",
        default: {},
        displayOptions: {
            show: showOnlyForLeadUpdate,
        },
        options: [
            {
                displayName: "Address",
                name: "address",
                type: "string",
                default: "",
            },
            {
                displayName: "City",
                name: "city",
                type: "string",
                default: "",
            },
            {
                displayName: "Company Name",
                name: "companyName",
                type: "string",
                default: "",
            },
            {
                displayName: "Department",
                name: "department",
                type: "string",
                default: "",
            },
            {
                displayName: "Designation",
                name: "designation",
                type: "string",
                default: "",
            },
            {
                displayName: "First Name",
                name: "firstName",
                type: "string",
                default: "",
            },
            {
                displayName: "Last Name",
                name: "lastName",
                type: "string",
                default: "",
            },
            {
                displayName: "State",
                name: "state",
                type: "string",
                default: "",
            },
            {
                displayName: "Zipcode",
                name: "zipcode",
                type: "string",
                default: "",
            },
        ],
    },
];
