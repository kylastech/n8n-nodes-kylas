import type { INodeProperties } from 'n8n-workflow';
import { companySearchDescription } from './search';

const showOnlyForCompanies = {
	resource: ['company'],
};

export const companyDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForCompanies,
		},
		options: [
			{
				name: 'Search',
				value: 'search',
				action: 'Search companies',
				description: 'Search companies',
			},
		],
		default: 'search',
	},
	...companySearchDescription,
];
