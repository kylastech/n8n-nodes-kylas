import type { INodeProperties } from 'n8n-workflow';

const showOnlyForLeadSearch = {
    operation: ['search'],
    resource: ['lead'],
};

export const leadSearchDescription: INodeProperties[] = [
    {
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForLeadSearch
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 50,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Advanced Options',
		name: 'showAdvancedOptions',
		type: 'boolean',
		displayOptions: {
			show: {
				...showOnlyForLeadSearch
			},
		},
		default: false,
		description: 'Whether to show advanced filtering and field selection options',
	},
	{
		displayName: 'Fields to Return',
		name: 'fields',
		type: 'string',
		displayOptions: {
			show: {
				...showOnlyForLeadSearch,
				showAdvancedOptions: [true],
			},
		},
		default: '',
		placeholder: 'id,name,ownerId,emails,phoneNumbers',
		description: 'Comma-separated list of fields to return. Leave empty to return all fields.',
	},
	{
		displayName: 'Filter Rules (JSON)',
		name: 'jsonRule',
		type: 'json',
		displayOptions: {
			show: {
				...showOnlyForLeadSearch,
				showAdvancedOptions: [true],
			},
		},
		default: '{\n  "condition": "AND",\n  "rules": [\n    {\n      "operator": "equal",\n      "id": "country",\n      "field": "country",\n      "type": "long",\n      "value": 175\n    },\n    {\n      "operator": "contains",\n      "id": "firstName",\n      "field": "firstName",\n      "type": "string",\n      "value": "abc"\n    }\n  ],\n  "valid": true\n}',
		description: 'JSON rule object for filtering leads. Supports complex AND conditions. Available operators: equal, not_equal, contains, not_contains, greater_than, less_than, between, in, not_in. Field types: string, long, double, date.',
	},
];
