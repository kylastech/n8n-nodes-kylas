import type { INodeProperties } from 'n8n-workflow';
import { leadCreateDescription } from './create';
import { customFieldsDescription } from './customFields';
import { leadUpdateDescription } from './update';
import { customFieldsUpdateDescription } from './customFieldsUpdate';
import { leadGetDescription } from './get';
import { leadSearchDescription } from './search';

const showOnlyForLeads = {
	resource: ['lead'],
};

export const leadDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForLeads,
		},
		options: [
			{
				name: 'Search',
				value: 'search',
				action: 'Search leads',
				description: 'Search leads',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a lead',
				description: 'Get the data of a single lead',
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create a new lead',
				description: 'Create a new lead',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a lead',
				description: 'Update an existing lead',
			},
		],
		default: 'get',
	},
	...leadCreateDescription,
	...customFieldsDescription,
	...leadUpdateDescription,
	...customFieldsUpdateDescription,
	...leadGetDescription,
	...leadSearchDescription
];
