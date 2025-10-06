import { userDescription } from './resources/user';
import { companyDescription } from './resources/company';
import { leadDescription } from './resources/lead';
import { isValidFieldType } from './resources/lead/customFields';
import {
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IHookFunctions,
	IExecuteFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
	NodeApiError,
	NodeOperationError,
	JsonObject,
	INodeExecutionData,
	ApplicationError
} from 'n8n-workflow';

import { version } from '../../package.json'

interface PicklistItem {
	active: boolean;
	value: string;
	displayName: string;
}


export class Kylas implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Kylas',
		name: 'kylas',
		icon: { light: 'file:kylas.svg', dark: 'file:kylas.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Kylas API',
		defaults: {
			name: 'Kylas',
		},
		usableAsTool: true,
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'kylasApi', required: true }],
		requestDefaults: {
			baseURL: 'https://api.kylas.io',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'User',
						value: 'user',
					},
					{
						name: 'Company',
						value: 'company',
					},
					{
						name: 'Lead',
						value: 'lead',
					},
				],
				default: 'user',
			},
			...userDescription,
			...companyDescription,
			...leadDescription
		],
	};

	methods = {
		loadOptions: {
			async getLeadCustomFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const fields = await getCachedSystemFields.call(this);
				// Ensure fields is an array before calling filter
				if (!Array.isArray(fields)) {
					return returnData; // Return empty array instead of throwing
				}

				fields
					.filter(field => field.active
						&& field.standard === false
						&& field.type !== 'LOOK_UP'
						&& field.type !== 'MULTI_PICKLIST'
						&& field.type !== 'PICK_LIST'
					)
					.forEach(field => {
						// Include field type information in the display name and store metadata as JSON
						const fieldMetadata = {
							name: field.name,
							type: field.type,
							required: field.required || false,
							picklist: field.picklist
						};

						returnData.push({
							name: `${field.displayName} (${field.type})`,
							value: JSON.stringify(fieldMetadata),
							description: `Field type: ${field.type}${field.required ? ' (Required)' : ''}`,
						});
					});
				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData: IDataObject | IDataObject[];

				if (resource === 'lead') {
					responseData = await handleLeadOperations.call(this, operation, i);
				} else if (resource === 'user') {
					responseData = await handleUserOperations.call(this, operation, i);
				} else if (resource === 'company') {
					responseData = await handleCompanyOperations.call(this, operation, i);
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
				}

				if (Array.isArray(responseData)) {
					returnData.push(...responseData.map(item => ({ json: item })));
				} else {
					returnData.push({ json: responseData });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

// Helper functions for handling different operations
async function handleLeadOperations(this: IExecuteFunctions, operation: string, itemIndex: number): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'create':
			return await createLead.call(this, itemIndex);
		case 'update':
			return await updateLead.call(this, itemIndex);
		case 'get':
			return await getLead.call(this, itemIndex);
		case 'search':
			return await searchLeads.call(this, itemIndex);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown lead operation: ${operation}`);
	}
}

async function handleUserOperations(this: IExecuteFunctions, operation: string, itemIndex: number): Promise<IDataObject | IDataObject[]> {
	switch (operation) {

		case 'get':
			return await getUser.call(this, itemIndex);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown user operation: ${operation}`);
	}
}

async function handleCompanyOperations(this: IExecuteFunctions, operation: string, itemIndex: number): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'search':
			return await searchCompanies.call(this, itemIndex);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown company operation: ${operation}`);
	}
}

// Lead operation functions
async function createLead(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const firstName = this.getNodeParameter('firstName', itemIndex) as string;
	const lastName = this.getNodeParameter('lastName', itemIndex) as string;
	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
	const customFields = this.getNodeParameter('customFields.customField', itemIndex, []) as Array<{
		name: string;
		value: string;
	}>;

	const body: IDataObject = {
		firstName,
		lastName,
		...additionalFields,
	};

	// Process custom fields with proper type handling
	if (customFields.length > 0) {
		body.customFieldValues = {};
		customFields.forEach(field => {
			if (field.name) {
				try {
					// Parse field metadata to get the actual field name and type
					const fieldMetadata = JSON.parse(field.name);
					const fieldName = fieldMetadata.name;
					const fieldType = fieldMetadata.type;

					// Validate field type
					if (!isValidFieldType(fieldType)) {
						console.warn(`Invalid field type: ${fieldType}, skipping field`);
						return; // Skip this field
					}


					// Convert value based on field type
					let processedValue: string | number | boolean = field.value;

					// Type conversion based on field type
					switch (fieldType) {
						case 'NUMBER':
							processedValue = parseFloat(field.value);
							if (isNaN(processedValue)) {
								console.warn(`Invalid number value for ${fieldName}: ${field.value}`);
								return;
							}
							break;
						case 'DATE_PICKER':
						case 'DATETIME_PICKER':
							// Validate date format if needed
							if (field.value && !isNaN(Date.parse(field.value))) {
								processedValue = field.value;
							} else if (field.value) {
								console.warn(`Invalid date value for ${fieldName}: ${field.value}`);
								return;
							}
							break;
						default:
							// For text-based fields, use value as-is
							processedValue = field.value;
					}

					// Only add the field if it has a valid value
					if (processedValue !== undefined && processedValue !== '' && processedValue !== null) {
						(body.customFieldValues as IDataObject)[fieldName] = processedValue;
					}
				} catch (error) {
					// If JSON parsing fails, treat fieldName as the actual field name (backward compatibility)
					console.warn('Failed to parse field metadata, using fieldName directly:', error);
					if (field.value !== undefined && field.value !== '' && field.value !== null) {
						(body.customFieldValues as IDataObject)[field.name] = field.value;
					}
				}
			}
		});
	}
	const response = await kylasApiRequest.call(this, 'POST', '/v1/leads', body);

	// Parse the response data if it's a string
	let leadData = response.data;
	if (typeof leadData === 'string') {
		try {
			leadData = JSON.parse(leadData);
		} catch (error) {
			throw new ApplicationError(`Failed to parse created lead data: ${error.message}`);
		}
	}

	return leadData as IDataObject;
}

async function updateLead(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const leadId = this.getNodeParameter('leadId', itemIndex) as string;
	const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;
	const customFields = this.getNodeParameter('customFields.customField', itemIndex, []) as Array<{
		fieldName: string;
		value: string;
	}>;

	// Step 1: Get existing lead data first
	let existingLead: IDataObject;
	try {
		existingLead = await getLead.call(this, itemIndex) as IDataObject;
	} catch (error) {
		throw new ApplicationError(`Failed to fetch existing lead with ID ${leadId}: ${error.message}`);
	}

	// Step 2: Field-by-field merge of existing data with update fields
	const body: IDataObject = { ...existingLead }; // Start with existing data


	// Perform field-by-field merge
	const mergedFields: string[] = [];
	Object.keys(updateFields).forEach(fieldName => {
		const newValue = updateFields[fieldName];
		const existingValue = body[fieldName];

		// Only update if the new value is different from existing
		if (newValue !== existingValue) {
			body[fieldName] = newValue;
			mergedFields.push(`${fieldName}: ${JSON.stringify(existingValue)} → ${JSON.stringify(newValue)}`);
		}
	});

	// Step 3: Handle custom fields merging
	// Start with existing custom field values, then merge with updates
	const existingCustomFields = (existingLead.customFieldValues as IDataObject) || {};
	body.customFieldValues = { ...existingCustomFields };

	// Process new/updated custom fields with proper type handling
	if (customFields.length > 0) {
		customFields.forEach(field => {
			if (field.fieldName) {
				try {
					// Parse field metadata to get the actual field name and type
					const fieldMetadata = JSON.parse(field.fieldName);
					const fieldName = fieldMetadata.name;
					const fieldType = fieldMetadata.type;

					// Validate field type
					if (!isValidFieldType(fieldType)) {
						console.warn(`Invalid field type: ${fieldType}, skipping field`);
						return; // Skip this field
					}

					// Convert value based on field type
					let processedValue: string | number | boolean = field.value;

					// Type conversion based on field type
					switch (fieldType) {
						case 'NUMBER':
							processedValue = parseFloat(field.value);
							if (isNaN(processedValue)) {
								console.warn(`Invalid number value for ${fieldName}: ${field.value}`);
								return;
							}
							break;
						case 'DATE_PICKER':
						case 'DATETIME_PICKER':
							// Validate date format if needed
							if (field.value && !isNaN(Date.parse(field.value))) {
								processedValue = field.value;
							} else if (field.value) {
								console.warn(`Invalid date value for ${fieldName}: ${field.value}`);
								return;
							}
							break;
						case 'PICK_LIST':
						case 'MULTI_PICKLIST':
							// For picklist fields, use value as-is
							processedValue = field.value;
							break;
						default:
							// For text-based fields (TEXT_FIELD, URL, etc.), use value as-is
							processedValue = field.value;
					}

					// Only add the field if it has a valid value
					if (processedValue !== undefined && processedValue !== '' && processedValue !== null) {
						(body.customFieldValues as IDataObject)[fieldName] = processedValue;
					}
				} catch (error) {
					// If JSON parsing fails, treat fieldName as the actual field name (backward compatibility)
					console.warn('Failed to parse field metadata, using fieldName directly:', error);
					if (field.value !== undefined && field.value !== '' && field.value !== null) {
						(body.customFieldValues as IDataObject)[field.fieldName] = field.value;
					}
				}
			}
		});
	}

// Step 4: Remove system-generated fields that shouldn't be updated
// These fields are typically read-only and managed by the system
const fieldsToExclude = ['id', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'];
fieldsToExclude.forEach(field => {
	delete body[field];
});


// Step 5: Send PUT request with merged data
const response = await kylasApiRequest.call(this, 'PUT', `/v1/leads/${leadId}`, body);

// Parse the response data if it's a string
let leadData = response.data;
if (typeof leadData === 'string') {
	try {
		leadData = JSON.parse(leadData);
	} catch (error) {
		throw new ApplicationError(`Failed to parse updated lead data: ${error.message}`);
	}
}

return leadData as IDataObject;
}

async function getLead(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const leadId = this.getNodeParameter('leadId', itemIndex) as string;
	const response = await kylasApiRequest.call(this, 'GET', `/v1/leads/${leadId}`, {});

	// Parse the response data if it's a string
	let leadData = response.data;
	if (typeof leadData === 'string') {
		try {
			leadData = JSON.parse(leadData);
		} catch (error) {
			throw new ApplicationError(`Failed to parse lead data: ${error.message}`);
		}
	}

	return leadData as IDataObject;
}

async function searchLeads(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const limit = this.getNodeParameter('limit', itemIndex, 10) as number;
	const showAdvancedOptions = this.getNodeParameter('showAdvancedOptions', itemIndex, false) as boolean;

	// Initialize the request body with proper structure
	const body: IDataObject = {};

	body.fields = ["id","firstName", "lastName", "emails", "phoneNumbers", "id", "customFieldValues"];
	body.jsonRule = null;

	// Handle advanced options if enabled
	if (showAdvancedOptions) {
		populateSearchRequestBody.call(this, itemIndex, body);
	}

	
	const response = await kylasApiRequest.call(this, 'POST', `/v1/search/lead?page=0&size=${limit}&sort=updatedAt,desc`, body);

	// Parse the response data if it's a string
	let searchData = response.data;
	if (typeof searchData === 'string') {
		try {
			searchData = JSON.parse(searchData);
		} catch (error) {
			throw new ApplicationError(`Failed to parse search lead data: ${error.message}`);
		}
	}

	return searchData as IDataObject;
}

// User operation functions

async function getUser(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const userId = this.getNodeParameter('userId', itemIndex) as string;
	const response = await kylasApiRequest.call(this, 'GET', `/v1/users/${userId}`, {});
	return JSON.parse(response.data as string) ;
}

// Company operation functions
async function searchCompanies(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const limit = this.getNodeParameter('limit', itemIndex, 10) as number;
	const showAdvancedOptions = this.getNodeParameter('showAdvancedOptions', itemIndex, false) as boolean;

	// Initialize the request body with proper structure
	const body: IDataObject = {};

	body.fields = ["name", "emails", "phoneNumbers", "associatedContacts", "associatedDeals", "id", "customFieldValues"];
	body.jsonRule = null;

	// Handle advanced options if enabled
	if (showAdvancedOptions) {
		// Handle fields
		populateSearchRequestBody.call(this, itemIndex, body);
	}

	const response = await kylasApiRequest.call(this, 'POST', `/v1/search/company?page=0&size=${limit}&sort=updatedAt,desc`, body);

	// Parse the response data if it's a string
	let searchData = response.data;
	if (typeof searchData === 'string') {
		try {
			searchData = JSON.parse(searchData);
		} catch (error) {
			throw new ApplicationError(`Failed to parse search company data: ${error.message}`);
		}
	}

	return searchData as IDataObject;
}

function populateSearchRequestBody(this: IExecuteFunctions, itemIndex: number, body: IDataObject) {
	const fields = this.getNodeParameter('fields', itemIndex, '') as string;
	if (fields && typeof fields === 'string') {
		const fieldsString = fields.trim();
		if (fieldsString) {
			body.fields = fieldsString.split(',').map(field => field.trim()).filter(field => field);
		}
	}

	// Handle jsonRule
	const jsonRule = this.getNodeParameter('jsonRule', itemIndex, '') as string;
	if (jsonRule) {
		try {
			if (typeof jsonRule === 'string' && jsonRule.trim() !== '') {
				body.jsonRule = JSON.parse(jsonRule);
			} else if (typeof jsonRule === 'object') {
				body.jsonRule = jsonRule;
			}
		} catch (error) {
			throw new NodeOperationError(this.getNode(), `Invalid JSON Rule format: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}
}

// Utility function to get lead custom fields as Fields type
export async function getLeadCustomFieldsAsFields(context: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions): Promise<Fields> {
	const fieldsData = await getCachedSystemFields.call(context);

	// Ensure fieldsData is an array before calling filter
	if (!Array.isArray(fieldsData)) {
		console.error('Expected fieldsData to be an array, got:', typeof fieldsData, fieldsData);
		throw new ApplicationError('Invalid fields data: expected an array');
	}

	const filteredFields = fieldsData
		.filter(field => field.active
			&& field.standard === false
			&& field.type !== 'LOOK_UP'
			&& field.type !== 'MULTI_PICKLIST'
			&& field.type !== 'PICK_LIST'
		)
		.map(field => ({
			name: field.name,
			displayName: field.displayName,
			type: field.type,
			required: field.required || false,
			standard: field.standard || false,
			internal: field.internal || false
		}));

	const result: Fields = {
		fields: filteredFields
	};

	return result;
}

let systemFieldsCache: RawFieldData[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Function to clear cache for testing
export function clearSystemFieldsCache(): void {
	systemFieldsCache = null;
	cacheTimestamp = 0;
}

export async function getCachedSystemFields(this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions): Promise<RawFieldData[]> {
	const now = Date.now();

	// Check if cache is valid (not expired)
	if (systemFieldsCache && (now - cacheTimestamp) < CACHE_DURATION) {
		return systemFieldsCache;
	}

	// Cache is expired or doesn't exist, fetch fresh data
	const customFields = await kylasApiRequest.call(this, 'GET', '/v1/layouts/leads/system-fields?view=create', {});
	const responseData = JSON.parse(customFields.data as string);

	// API returns a direct array of field objects
	if (!Array.isArray(responseData)) {
		console.error('Expected API to return an array of fields, got:', typeof responseData, responseData);
		throw new ApplicationError('Invalid API response: expected an array of field objects');
	}

	const fields: RawFieldData[] = responseData as RawFieldData[];

	// Update cache
	systemFieldsCache = fields;
	cacheTimestamp = now;

	return fields;
}


export async function kylasApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject
): Promise<KylasApiResponse> {


	const options: IHttpRequestOptions = {
		headers: {
			Accept: 'application/json',
			'User-Agent':`kylas-n8n-version-${version}`
		},
		method,
		url: `https://api.kylas.io${endpoint}`,
	};


	if (Object.keys(body).length !== 0) {
		options.body = body;
		options.json = true;
	}

	try {
		const credentialType = 'kylasApi';
		const responseData = await this.helpers.httpRequestWithAuthentication.call(
			this,
			credentialType,
			options,
		);


		if (responseData && responseData.success === false) {
			throw new NodeApiError(this.getNode(), responseData as JsonObject);
		}
		return {
			data: responseData
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
};

// Interface for API response
interface KylasApiResponse {
	data: string | IDataObject | IDataObject[] | RawFieldData[]; // Can be object, array of objects, or array of field data
	success?: boolean;
}

// Interface for raw field data from API
interface RawFieldData {
	id: number;
	type: string;
	displayName: string;
	name: string;
	active: boolean;
	required: boolean;
	important: boolean;
	standard: boolean;
	width: number;
	column: number;
	row: number;
	multiValue: boolean;
	internal: boolean;
	picklist?: PicklistItem[];
	systemRequired: boolean;
	inputSchema?: unknown;
}

export type Fields = {
	fields: Array<{
		name: string;
		displayName: string;
		type: string;
		required: boolean;
		standard: boolean;
		internal: boolean;
	}>;
}