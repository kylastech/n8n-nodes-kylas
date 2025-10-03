/**
 * Integration test to verify the fields.filter fix works correctly
 * This test simulates the actual n8n environment and API responses
 */

const { getCachedSystemFields, getLeadCustomFieldsAsFields } = require('../dist/nodes/Kylas/Kylas.node');

// Simulate the actual API response structure
const simulateApiResponse = (data) => {
    return data; // Now we return data directly since kylasApiRequest no longer stringifies
};

// Test data that matches the actual API response format
const validApiResponse = [
    {
        id: 301,
        type: "TEXT_FIELD",
        displayName: "Department Code",
        name: "departmentCode",
        active: true,
        required: false,
        important: false,
        standard: false,
        width: 12,
        column: 1,
        row: 1,
        multiValue: false,
        internal: false,
        systemRequired: false
    },
    {
        id: 302,
        type: "NUMBER",
        displayName: "Company Size",
        name: "companySize",
        active: true,
        required: true,
        important: true,
        standard: false,
        width: 6,
        column: 2,
        row: 1,
        multiValue: false,
        internal: false,
        systemRequired: false
    }
];

describe('Integration Tests - Fields Filter Fix', () => {
    
    test('Should handle valid API response without fields.filter error', async () => {
        const mockContext = {
            helpers: {
                requestWithAuthentication: {
                    call: async function() {
                        return simulateApiResponse(validApiResponse);
                    }
                }
            },
            getNode: () => ({ name: 'test-node' })
        };

        // This should not throw "fields.filter is not a function" error
        const fields = await getCachedSystemFields.call(mockContext);
        
        expect(Array.isArray(fields)).toBe(true);
        expect(fields).toHaveLength(2);
        expect(fields[0]).toHaveProperty('name', 'departmentCode');
        expect(fields[1]).toHaveProperty('name', 'companySize');
    });

    test('Should handle getLeadCustomFieldsAsFields without filter error', async () => {
        const mockContext = {
            helpers: {
                requestWithAuthentication: {
                    call: async function() {
                        return simulateApiResponse(validApiResponse);
                    }
                }
            },
            getNode: () => ({ name: 'test-node' })
        };

        // This should not throw "fields.filter is not a function" error
        const result = await getLeadCustomFieldsAsFields(mockContext);
        
        expect(result).toHaveProperty('fields');
        expect(Array.isArray(result.fields)).toBe(true);
        expect(result.fields).toHaveLength(2);
        
        result.fields.forEach(field => {
            expect(field).toHaveProperty('name');
            expect(field).toHaveProperty('displayName');
            expect(field).toHaveProperty('type');
            expect(field).toHaveProperty('required');
            expect(field).toHaveProperty('standard');
            expect(field).toHaveProperty('internal');
        });
    });

    test('Should reject invalid API responses with clear error message', async () => {
        const mockContext = {
            helpers: {
                requestWithAuthentication: {
                    call: async function() {
                        return simulateApiResponse({ invalid: 'response' });
                    }
                }
            },
            getNode: () => ({ name: 'test-node' })
        };

        await expect(getCachedSystemFields.call(mockContext))
            .rejects
            .toThrow('Invalid API response: expected an array of field objects');
    });

    test('Should handle empty array response correctly', async () => {
        const mockContext = {
            helpers: {
                requestWithAuthentication: {
                    call: async function() {
                        return simulateApiResponse([]);
                    }
                }
            },
            getNode: () => ({ name: 'test-node' })
        };

        const fields = await getCachedSystemFields.call(mockContext);
        
        expect(Array.isArray(fields)).toBe(true);
        expect(fields).toHaveLength(0);
    });

    test('Should handle API response with mixed field types correctly', async () => {
        const mixedFieldsResponse = [
            {
                id: 1,
                type: "TEXT_FIELD",
                displayName: "Text Field",
                name: "textField",
                active: true,
                required: false,
                standard: false,
                internal: false
            },
            {
                id: 2,
                type: "PICK_LIST",
                displayName: "Pick List Field",
                name: "pickListField",
                active: true,
                required: false,
                standard: false,
                internal: false,
                picklist: [
                    { active: true, value: "option1", displayName: "Option 1" }
                ]
            },
            {
                id: 3,
                type: "LOOK_UP",
                displayName: "Lookup Field",
                name: "lookupField",
                active: true,
                required: false,
                standard: false,
                internal: false
            },
            {
                id: 4,
                type: "NUMBER",
                displayName: "Number Field",
                name: "numberField",
                active: true,
                required: false,
                standard: false,
                internal: false
            }
        ];

        const mockContext = {
            helpers: {
                requestWithAuthentication: {
                    call: async function() {
                        return simulateApiResponse(mixedFieldsResponse);
                    }
                }
            },
            getNode: () => ({ name: 'test-node' })
        };

        const result = await getLeadCustomFieldsAsFields(mockContext);
        
        // Should filter out PICK_LIST and LOOK_UP fields
        expect(result.fields).toHaveLength(2);
        
        const fieldNames = result.fields.map(f => f.name);
        expect(fieldNames).toContain('textField');
        expect(fieldNames).toContain('numberField');
        expect(fieldNames).not.toContain('pickListField');
        expect(fieldNames).not.toContain('lookupField');
    });

    test('Should maintain field properties correctly after filtering', async () => {
        const mockContext = {
            helpers: {
                requestWithAuthentication: {
                    call: async function() {
                        return simulateApiResponse(validApiResponse);
                    }
                }
            },
            getNode: () => ({ name: 'test-node' })
        };

        const result = await getLeadCustomFieldsAsFields(mockContext);
        
        // Check that the first field maintains its properties
        const firstField = result.fields[0];
        expect(firstField.name).toBe('departmentCode');
        expect(firstField.displayName).toBe('Department Code');
        expect(firstField.type).toBe('TEXT_FIELD');
        expect(firstField.required).toBe(false);
        expect(firstField.standard).toBe(false);
        expect(firstField.internal).toBe(false);

        // Check that the second field maintains its properties
        const secondField = result.fields[1];
        expect(secondField.name).toBe('companySize');
        expect(secondField.displayName).toBe('Company Size');
        expect(secondField.type).toBe('NUMBER');
        expect(secondField.required).toBe(true);
        expect(secondField.standard).toBe(false);
        expect(secondField.internal).toBe(false);
    });
});

console.log('Integration tests created successfully!');
console.log('Run with: npm test or node test/integration.test.js');
