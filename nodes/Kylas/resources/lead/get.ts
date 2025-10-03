import type { INodeProperties } from 'n8n-workflow';

const showOnlyForLeadGet = {
    operation: ['get'],
    resource: ['lead'],
};

export const leadGetDescription: INodeProperties[] = [
    {
        displayName: "Lead ID",
        name: "leadId",
        description: 'ID of the lead to retrieve',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
            show: showOnlyForLeadGet,
        },
    },
];
