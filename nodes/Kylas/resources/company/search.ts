import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCompanyGetMany = {
	operation: ['search'],
	resource: ['company'],
};

/**
 * Properties for searching companies in Kylas.
 * 
 * - Limit: Max number of results to return (min: 1, max: 25, default: 50).
 * - Advanced Options: Toggle to show advanced filtering and field selection.
 * - Fields to Return: Comma-separated list of fields to return (shown when Advanced Options is enabled).
 * - Filter Rules (JSON): JSON object for advanced filtering (shown when Advanced Options is enabled).
 */
export const companySearchDescription: INodeProperties[] = [
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForCompanyGetMany
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
				...showOnlyForCompanyGetMany
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
				...showOnlyForCompanyGetMany,
				showAdvancedOptions: [true],
			},
		},
		default: '',
		placeholder: 'name,ownedBy,industry,emails,phoneNumbers',
		description: 'Comma-separated list of fields to return. Leave empty to return all fields.',
	},
	{
		displayName: 'Filter Rules (JSON)',
		name: 'jsonRule',
		type: 'json',
		displayOptions: {
			show: {
				...showOnlyForCompanyGetMany,
				showAdvancedOptions: [true],
			},
		},
		default: '{\n  "condition": "AND",\n  "rules": [\n    {\n      "operator": "contains",\n      "id": "name",\n      "field": "name",\n      "type": "string",\n      "value": "n8n"\n    }\n  ],\n  "valid": true\n}',
		description: 'JSON rule object for filtering companies. Supports complex AND conditions. Available operators: equal, not_equal, contains, not_contains, greater_than, less_than, between, in, not_in. Field types: string, long, double, date.',
	}
];
