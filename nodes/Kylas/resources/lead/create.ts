import type { INodeProperties } from 'n8n-workflow';

const showOnlyForLeadCreate = {
    operation: ['create'],
    resource: ['lead'],
};

export const leadCreateDescription: INodeProperties[] = [
    {
        displayName: "First Name",
        name: "firstName",
        description: 'First name of the lead',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
            show: showOnlyForLeadCreate,
        },
    },
    {
        displayName: "Last Name",
        name: "lastName",
        description: 'Last name of the lead',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
            show: showOnlyForLeadCreate,
        },
    },
    {
        displayName: "Additional Fields",
        name: "additionalFields",
        type: "collection",
        placeholder: "Add Field",
        default: {},
        displayOptions: {
            show: showOnlyForLeadCreate,
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
