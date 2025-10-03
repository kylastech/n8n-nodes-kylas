// Test script to verify the company filtering request body format
// This simulates how the getAllCompanies function should format the request body

function testRequestBodyFormat() {
    console.log('Testing Company Filtering Request Body Format\n');

    // Test case 1: Advanced Options with fields and jsonRule
    const additionalOptions1 = {
        fields: "name,ownedBy,industry,emails,phoneNumbers,businessType,createdBy,updatedBy,associatedContacts,associatedDeals,id,customFieldValues",
        jsonRule: JSON.stringify({
            "condition": "AND",
            "rules": [
                {
                    "operator": "equal",
                    "id": "country",
                    "field": "country",
                    "type": "long",
                    "value": 175
                },
                {
                    "operator": "contains",
                    "id": "name",
                    "field": "name",
                    "type": "string",
                    "value": "abc"
                }
            ],
            "valid": true
        })
    };

    const body1 = {};
    
    // Handle fields
    if (additionalOptions1.fields && typeof additionalOptions1.fields === 'string') {
        const fieldsString = additionalOptions1.fields.trim();
        if (fieldsString) {
            body1.fields = fieldsString.split(',').map(field => field.trim()).filter(field => field);
        }
    }

    // Handle jsonRule
    if (additionalOptions1.jsonRule) {
        try {
            if (typeof additionalOptions1.jsonRule === 'string') {
                body1.jsonRule = JSON.parse(additionalOptions1.jsonRule);
            } else {
                body1.jsonRule = additionalOptions1.jsonRule;
            }
        } catch (error) {
            console.error(`Invalid JSON Rule format: ${error.message}`);
        }
    }

    console.log('Test Case 1 - Advanced Options:');
    console.log('Expected format: {"fields":["name","ownedBy"...],"jsonRule":{"condition":"AND"...}}');
    console.log('Actual result:');
    console.log(JSON.stringify(body1, null, 2));
    console.log('\n');

    // Test case 2: Legacy rule format
    const legacyRule = JSON.stringify({
        "fields": ["name","ownedBy","industry","emails","phoneNumbers","businessType","createdBy","updatedBy","associatedContacts","associatedDeals","id","customFieldValues"],
        "jsonRule": {
            "condition": "AND",
            "rules": [
                {
                    "operator": "equal",
                    "id": "country",
                    "field": "country",
                    "type": "long",
                    "value": 175
                },
                {
                    "operator": "contains",
                    "id": "name",
                    "field": "name",
                    "type": "string",
                    "value": "abc"
                }
            ],
            "valid": true
        }
    });

    const body2 = {};
    
    if (legacyRule && legacyRule.trim() !== '') {
        try {
            const parsedRule = JSON.parse(legacyRule);
            if (parsedRule.fields) {
                body2.fields = parsedRule.fields;
            }
            if (parsedRule.jsonRule) {
                body2.jsonRule = parsedRule.jsonRule;
            }
        } catch (error) {
            console.error(`Invalid rule JSON format: ${error.message}`);
        }
    }

    console.log('Test Case 2 - Legacy Rule:');
    console.log('Expected format: {"fields":["name","ownedBy"...],"jsonRule":{"condition":"AND"...}}');
    console.log('Actual result:');
    console.log(JSON.stringify(body2, null, 2));
    console.log('\n');

    // Verify both produce the same structure
    const body1Str = JSON.stringify(body1);
    const body2Str = JSON.stringify(body2);
    
    console.log('✅ Both methods produce identical results:', body1Str === body2Str);
    
    // Check if the format matches the expected structure
    const hasCorrectStructure = body1.fields && Array.isArray(body1.fields) && 
                               body1.jsonRule && typeof body1.jsonRule === 'object' &&
                               body1.jsonRule.condition && body1.jsonRule.rules && Array.isArray(body1.jsonRule.rules);
    
    console.log('✅ Request body has correct structure:', hasCorrectStructure);
    
    if (hasCorrectStructure) {
        console.log('✅ Fields array length:', body1.fields.length);
        console.log('✅ Rules array length:', body1.jsonRule.rules.length);
        console.log('✅ Condition type:', body1.jsonRule.condition);
    }
}

// Run the test
testRequestBodyFormat();
