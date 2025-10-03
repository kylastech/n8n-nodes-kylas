/**
 * Test cases for load options functions that depend on system fields
 * Tests getLeadCustomFields and getAvailableCustomFields functions
 */

const { mockFieldsResponse, createMockContext } = require('./system-fields.test');

// Mock the Kylas node class and its methods
const KylasNode = require('../dist/nodes/Kylas/Kylas.node').Kylas;

describe('Load Options Tests', () => {
    let kylasInstance;
    
    beforeEach(() => {
        kylasInstance = new KylasNode();
    });

    test('getLeadCustomFields should return formatted options for valid fields', async () => {
        const mockContext = {
            ...createMockContext(),
            // Mock the loadOptions context methods
        };
        
        const result = await kylasInstance.methods.loadOptions.getLeadCustomFields.call(mockContext);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        
        // Check the structure of returned options
        result.forEach(option => {
            expect(option).toHaveProperty('name');
            expect(option).toHaveProperty('value');
            expect(option).toHaveProperty('description');
            
            expect(typeof option.name).toBe('string');
            expect(typeof option.value).toBe('string');
            expect(typeof option.description).toBe('string');
            
            // Value should be valid JSON containing field metadata
            expect(() => JSON.parse(option.value)).not.toThrow();
            
            const metadata = JSON.parse(option.value);
            expect(metadata).toHaveProperty('name');
            expect(metadata).toHaveProperty('type');
            expect(metadata).toHaveProperty('required');
        });
    });

    test('getLeadCustomFields should handle empty fields gracefully', async () => {
        const mockContext = createMockContext([]);
        
        const result = await kylasInstance.methods.loadOptions.getLeadCustomFields.call(mockContext);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
    });

    test('getLeadCustomFields should handle invalid fields data gracefully', async () => {
        const mockContext = createMockContext("invalid");
        
        const result = await kylasInstance.methods.loadOptions.getLeadCustomFields.call(mockContext);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
    });

    test('getAvailableCustomFields should return available fields excluding selected ones', async () => {
        const mockContext = {
            ...createMockContext(),
            getCurrentNodeParameter: jest.fn().mockReturnValue([
                { fieldName: JSON.stringify({ name: 'departmentCode', type: 'TEXT_FIELD', required: false }) }
            ])
        };
        
        const result = await kylasInstance.methods.loadOptions.getAvailableCustomFields.call(mockContext);
        
        expect(Array.isArray(result)).toBe(true);
        
        // Should not include the already selected field (departmentCode)
        const fieldNames = result.map(option => {
            const metadata = JSON.parse(option.value);
            return metadata.name;
        });
        
        expect(fieldNames).not.toContain('departmentCode');
        expect(fieldNames).toContain('companySize'); // This should still be available
    });

    test('getAvailableCustomFields should handle getCurrentNodeParameter errors gracefully', async () => {
        const mockContext = {
            ...createMockContext(),
            getCurrentNodeParameter: jest.fn().mockImplementation(() => {
                throw new Error('Parameter not found');
            })
        };
        
        const result = await kylasInstance.methods.loadOptions.getAvailableCustomFields.call(mockContext);
        
        expect(Array.isArray(result)).toBe(true);
        // Should return all available fields when unable to get selected fields
        expect(result.length).toBeGreaterThan(0);
    });

    test('getAvailableCustomFields should handle malformed selected field data', async () => {
        const mockContext = {
            ...createMockContext(),
            getCurrentNodeParameter: jest.fn().mockReturnValue([
                { fieldName: 'invalid-json' }, // This will fail JSON.parse
                { fieldName: JSON.stringify({ name: 'validField', type: 'TEXT_FIELD', required: false }) }
            ])
        };
        
        const result = await kylasInstance.methods.loadOptions.getAvailableCustomFields.call(mockContext);
        
        expect(Array.isArray(result)).toBe(true);
        
        // Should handle the invalid JSON gracefully and still process valid entries
        const fieldNames = result.map(option => {
            const metadata = JSON.parse(option.value);
            return metadata.name;
        });
        
        // The field with invalid JSON should be treated as selected using the raw fieldName
        expect(fieldNames).not.toContain('invalid-json');
    });

    test('Field options should include type information in display name', async () => {
        const mockContext = createMockContext();
        
        const result = await kylasInstance.methods.loadOptions.getLeadCustomFields.call(mockContext);
        
        result.forEach(option => {
            // Display name should include the field type
            expect(option.name).toMatch(/\([A-Z_]+\)$/);
            
            // Description should mention field type
            expect(option.description).toContain('Field type:');
        });
    });

    test('Required fields should be marked in description', async () => {
        const mockContext = createMockContext();
        
        const result = await kylasInstance.methods.loadOptions.getLeadCustomFields.call(mockContext);
        
        result.forEach(option => {
            const metadata = JSON.parse(option.value);
            if (metadata.required) {
                expect(option.description).toContain('(Required)');
            } else {
                expect(option.description).not.toContain('(Required)');
            }
        });
    });

    test('Field filtering should exclude correct field types', async () => {
        const mockContext = createMockContext();
        
        const result = await kylasInstance.methods.loadOptions.getLeadCustomFields.call(mockContext);
        
        result.forEach(option => {
            const metadata = JSON.parse(option.value);
            expect(['LOOK_UP', 'MULTI_PICKLIST', 'PICK_LIST']).not.toContain(metadata.type);
        });
    });

    test('Field filtering should exclude standard and inactive fields', async () => {
        const mockContext = createMockContext();
        
        const result = await kylasInstance.methods.loadOptions.getLeadCustomFields.call(mockContext);
        
        // Based on our mock data, should only return departmentCode and companySize
        expect(result).toHaveLength(2);
        
        const fieldNames = result.map(option => {
            const metadata = JSON.parse(option.value);
            return metadata.name;
        });
        
        expect(fieldNames).toContain('departmentCode');
        expect(fieldNames).toContain('companySize');
        expect(fieldNames).not.toContain('leadSource'); // PICK_LIST
        expect(fieldNames).not.toContain('relatedAccount'); // LOOK_UP
        expect(fieldNames).not.toContain('standardField'); // standard field
        expect(fieldNames).not.toContain('inactiveField'); // inactive field
    });
});

module.exports = {
    KylasNode
};
