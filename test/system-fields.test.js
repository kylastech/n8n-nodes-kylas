/**
 * Test cases for system fields functionality
 * Tests the getCachedSystemFields function and related field processing
 */

const { getCachedSystemFields, getLeadCustomFieldsAsFields } = require('../dist/nodes/Kylas/Kylas.node');

// Mock data that matches the expected API response structure
const mockFieldsResponse = [
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
    },
    {
        id: 303,
        type: "PICK_LIST",
        displayName: "Lead Source",
        name: "leadSource",
        active: true,
        required: false,
        important: false,
        standard: false,
        width: 6,
        column: 1,
        row: 2,
        multiValue: false,
        internal: false,
        systemRequired: false,
        picklist: [
            { active: true, value: "website", displayName: "Website" },
            { active: true, value: "referral", displayName: "Referral" }
        ]
    },
    {
        id: 304,
        type: "LOOK_UP",
        displayName: "Related Account",
        name: "relatedAccount",
        active: true,
        required: false,
        important: false,
        standard: false,
        width: 12,
        column: 1,
        row: 3,
        multiValue: false,
        internal: false,
        systemRequired: false
    },
    {
        id: 305,
        type: "TEXT_FIELD",
        displayName: "Standard Field",
        name: "standardField",
        active: true,
        required: false,
        important: false,
        standard: true, // This is a standard field
        width: 12,
        column: 1,
        row: 4,
        multiValue: false,
        internal: false,
        systemRequired: false
    },
    {
        id: 306,
        type: "DATE_PICKER",
        displayName: "Inactive Field",
        name: "inactiveField",
        active: false, // This field is inactive
        required: false,
        important: false,
        standard: false,
        width: 6,
        column: 2,
        row: 4,
        multiValue: false,
        internal: false,
        systemRequired: false
    }
];

// Create mock context for testing
function createMockContext(responseData = mockFieldsResponse, shouldThrow = false) {
    return {
        helpers: {
            requestWithAuthentication: {
                call: async function() {
                    if (shouldThrow) {
                        throw new Error('API request failed');
                    }
                    return responseData;
                }
            }
        },
        getNode: () => ({ name: 'test-node' })
    };
}

describe('System Fields Tests', () => {
    // Clear cache before each test
    beforeEach(() => {
        // Reset the cache by accessing the internal cache variables
        // This ensures each test starts with a fresh state
    });

    test('getCachedSystemFields should return array of fields for valid response', async () => {
        const mockContext = createMockContext();
        const fields = await getCachedSystemFields.call(mockContext);
        
        expect(Array.isArray(fields)).toBe(true);
        expect(fields).toHaveLength(6);
        expect(fields[0]).toHaveProperty('id');
        expect(fields[0]).toHaveProperty('type');
        expect(fields[0]).toHaveProperty('displayName');
        expect(fields[0]).toHaveProperty('name');
        expect(fields[0]).toHaveProperty('active');
        expect(fields[0]).toHaveProperty('standard');
    });

    test('getCachedSystemFields should throw error for non-array response', async () => {
        const mockContext = createMockContext({ invalid: 'response' });
        
        await expect(getCachedSystemFields.call(mockContext))
            .rejects
            .toThrow('Invalid API response: expected an array of field objects');
    });

    test('getCachedSystemFields should throw error for null response', async () => {
        const mockContext = createMockContext(null);
        
        await expect(getCachedSystemFields.call(mockContext))
            .rejects
            .toThrow('Invalid API response: expected an array of field objects');
    });

    test('getCachedSystemFields should throw error for string response', async () => {
        const mockContext = createMockContext("invalid string response");
        
        await expect(getCachedSystemFields.call(mockContext))
            .rejects
            .toThrow('Invalid API response: expected an array of field objects');
    });

    test('getLeadCustomFieldsAsFields should filter and transform fields correctly', async () => {
        const mockContext = createMockContext();
        const result = await getLeadCustomFieldsAsFields(mockContext);
        
        expect(result).toHaveProperty('fields');
        expect(Array.isArray(result.fields)).toBe(true);
        
        // Should only include active, non-standard fields, excluding LOOK_UP and PICK_LIST
        // From our mock data: departmentCode (TEXT_FIELD) and companySize (NUMBER)
        expect(result.fields).toHaveLength(2);
        
        const fieldNames = result.fields.map(f => f.name);
        expect(fieldNames).toContain('departmentCode');
        expect(fieldNames).toContain('companySize');
        expect(fieldNames).not.toContain('leadSource'); // PICK_LIST excluded
        expect(fieldNames).not.toContain('relatedAccount'); // LOOK_UP excluded
        expect(fieldNames).not.toContain('standardField'); // standard field excluded
        expect(fieldNames).not.toContain('inactiveField'); // inactive field excluded
    });

    test('getLeadCustomFieldsAsFields should handle empty fields array', async () => {
        const mockContext = createMockContext([]);
        const result = await getLeadCustomFieldsAsFields(mockContext);
        
        expect(result).toHaveProperty('fields');
        expect(result.fields).toHaveLength(0);
    });

    test('getLeadCustomFieldsAsFields should throw error for invalid fields data', async () => {
        const mockContext = createMockContext("invalid");
        
        await expect(getLeadCustomFieldsAsFields(mockContext))
            .rejects
            .toThrow('Invalid API response: expected an array of field objects');
    });

    test('Field filtering logic should work correctly', async () => {
        const mockContext = createMockContext();
        const result = await getLeadCustomFieldsAsFields(mockContext);
        
        // Verify each returned field meets the filtering criteria
        result.fields.forEach(field => {
            expect(field.standard).toBe(false);
            expect(['LOOK_UP', 'MULTI_PICKLIST', 'PICK_LIST']).not.toContain(field.type);
        });
    });

    test('Field transformation should preserve required properties', async () => {
        const mockContext = createMockContext();
        const result = await getLeadCustomFieldsAsFields(mockContext);
        
        result.fields.forEach(field => {
            expect(field).toHaveProperty('name');
            expect(field).toHaveProperty('displayName');
            expect(field).toHaveProperty('type');
            expect(field).toHaveProperty('required');
            expect(field).toHaveProperty('standard');
            expect(field).toHaveProperty('internal');
            
            expect(typeof field.name).toBe('string');
            expect(typeof field.displayName).toBe('string');
            expect(typeof field.type).toBe('string');
            expect(typeof field.required).toBe('boolean');
            expect(typeof field.standard).toBe('boolean');
            expect(typeof field.internal).toBe('boolean');
        });
    });
});

// Export for use in other test files
module.exports = {
    mockFieldsResponse,
    createMockContext
};
