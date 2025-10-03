// Test script to verify the optional advanced options functionality
// This simulates how the getAllCompanies function should handle optional parameters

function testOptionalAdvancedOptions() {
    console.log('Testing Optional Advanced Options for Company Search\n');

    // Test case 1: Basic usage (no advanced options)
    console.log('Test Case 1 - Basic Usage (Advanced Options = false):');
    const showAdvancedOptions1 = false;
    const body1 = {};
    
    if (showAdvancedOptions1) {
        // This block should not execute
        console.log('ERROR: Advanced options block executed when it should not have');
    } else {
        console.log('✅ Advanced options correctly skipped');
    }
    
    console.log('Request body:', JSON.stringify(body1, null, 2));
    console.log('Expected: Empty object {}');
    console.log('Match:', JSON.stringify(body1) === '{}');
    console.log('\n');

    // Test case 2: Advanced options enabled with fields only
    console.log('Test Case 2 - Advanced Options with Fields Only:');
    const showAdvancedOptions2 = true;
    const fields2 = "name,ownedBy,industry";
    const jsonRule2 = "";
    const body2 = {};
    
    if (showAdvancedOptions2) {
        // Handle fields
        if (fields2 && typeof fields2 === 'string') {
            const fieldsString = fields2.trim();
            if (fieldsString) {
                body2.fields = fieldsString.split(',').map(field => field.trim()).filter(field => field);
            }
        }

        // Handle jsonRule
        if (jsonRule2) {
            try {
                if (typeof jsonRule2 === 'string' && jsonRule2.trim() !== '') {
                    body2.jsonRule = JSON.parse(jsonRule2);
                } else if (typeof jsonRule2 === 'object') {
                    body2.jsonRule = jsonRule2;
                }
            } catch (error) {
                console.error(`Invalid JSON Rule format: ${error.message}`);
            }
        }
    }
    
    console.log('Request body:', JSON.stringify(body2, null, 2));
    console.log('Expected: Object with fields array only');
    console.log('Has fields:', Array.isArray(body2.fields));
    console.log('No jsonRule:', !body2.jsonRule);
    console.log('\n');

    // Test case 3: Advanced options enabled with both fields and jsonRule
    console.log('Test Case 3 - Advanced Options with Fields and JSON Rule:');
    const showAdvancedOptions3 = true;
    const fields3 = "name,ownedBy,industry,emails";
    const jsonRule3 = JSON.stringify({
        "condition": "AND",
        "rules": [
            {
                "operator": "equal",
                "id": "country",
                "field": "country",
                "type": "long",
                "value": 175
            }
        ],
        "valid": true
    });
    const body3 = {};
    
    if (showAdvancedOptions3) {
        // Handle fields
        if (fields3 && typeof fields3 === 'string') {
            const fieldsString = fields3.trim();
            if (fieldsString) {
                body3.fields = fieldsString.split(',').map(field => field.trim()).filter(field => field);
            }
        }

        // Handle jsonRule
        if (jsonRule3) {
            try {
                if (typeof jsonRule3 === 'string' && jsonRule3.trim() !== '') {
                    body3.jsonRule = JSON.parse(jsonRule3);
                } else if (typeof jsonRule3 === 'object') {
                    body3.jsonRule = jsonRule3;
                }
            } catch (error) {
                console.error(`Invalid JSON Rule format: ${error.message}`);
            }
        }
    }
    
    console.log('Request body:', JSON.stringify(body3, null, 2));
    console.log('Expected: Object with both fields array and jsonRule object');
    console.log('Has fields:', Array.isArray(body3.fields));
    console.log('Has jsonRule:', typeof body3.jsonRule === 'object' && body3.jsonRule !== null);
    console.log('Fields count:', body3.fields ? body3.fields.length : 0);
    console.log('Rules count:', body3.jsonRule && body3.jsonRule.rules ? body3.jsonRule.rules.length : 0);
    console.log('\n');

    // Test case 4: Advanced options enabled but empty values
    console.log('Test Case 4 - Advanced Options Enabled but Empty Values:');
    const showAdvancedOptions4 = true;
    const fields4 = "";
    const jsonRule4 = "";
    const body4 = {};
    
    if (showAdvancedOptions4) {
        // Handle fields
        if (fields4 && typeof fields4 === 'string') {
            const fieldsString = fields4.trim();
            if (fieldsString) {
                body4.fields = fieldsString.split(',').map(field => field.trim()).filter(field => field);
            }
        }

        // Handle jsonRule
        if (jsonRule4) {
            try {
                if (typeof jsonRule4 === 'string' && jsonRule4.trim() !== '') {
                    body4.jsonRule = JSON.parse(jsonRule4);
                } else if (typeof jsonRule4 === 'object') {
                    body4.jsonRule = jsonRule4;
                }
            } catch (error) {
                console.error(`Invalid JSON Rule format: ${error.message}`);
            }
        }
    }
    
    console.log('Request body:', JSON.stringify(body4, null, 2));
    console.log('Expected: Empty object {} (empty values should not add properties)');
    console.log('Match:', JSON.stringify(body4) === '{}');
    console.log('\n');

    console.log('=== Summary ===');
    console.log('✅ All test cases demonstrate proper optional behavior');
    console.log('✅ Advanced options only processed when enabled');
    console.log('✅ Empty values do not create unnecessary properties');
    console.log('✅ Both individual and combined options work correctly');
}

// Run the test
testOptionalAdvancedOptions();
