# Test Suite for Kylas System Fields

This test suite verifies the fix for the "fields.filter is not a function" error and the enhanced API response handling for different endpoint types.

## Problems Fixed

The original errors occurred because:
1. The code assumed the API response would always be an array
2. No validation was performed before calling `.filter()` on the response
3. Different API response structures weren't handled properly
4. The `KylasApiResponse` interface was inconsistent with actual usage
5. The `updateLead` function could accidentally clear existing data by only sending update fields

## Solution Implemented

### 1. Enhanced API Response Handling
- Updated `KylasApiResponse` interface to handle both object and array responses
- Modified `kylasApiRequest` to return data directly instead of JSON stringified
- Added proper null/undefined response handling

### 2. Enhanced `getCachedSystemFields` Function
- Added proper validation to ensure the API response is an array
- Throws descriptive error messages for invalid responses
- Handles the expected direct array response from `/v1/layouts/leads/system-fields?view=create`
- Updated to work with new response format

### 3. Updated All API Consumer Functions
- **Object Response APIs**: `createLead`, `updateLead`, `getLead`, `getUser` - Return `response.data as IDataObject`
- **Array Response APIs**: `searchCompanies`, `searchLeads`, `getCachedSystemFields` - Handle array responses properly
- Removed unnecessary `JSON.parse()` calls since data is no longer stringified

### 4. Added Array Validation in Consumer Functions
- `getLeadCustomFieldsAsFields`: Validates fields data before filtering
- `getLeadCustomFields`: Returns empty array instead of crashing on invalid data
- `getAvailableCustomFields`: Gracefully handles invalid field data

### 5. Implemented Read-Modify-Write Pattern for `updateLead`
- **Enhanced Safety**: Now fetches existing lead data before updating
- **Data Preservation**: Merges existing data with updates instead of replacing
- **Custom Fields Protection**: Preserves existing custom fields not being updated
- **System Fields Exclusion**: Automatically excludes read-only system fields
- **Better Error Handling**: Validates lead exists before attempting update

### 6. Added Cache Management
- `clearSystemFieldsCache()`: Function to clear cache for testing
- Proper cache invalidation to prevent test interference
- Fixed cache duration checking in `getCachedSystemFields`

## Test Files

### `system-fields.test.js`
Comprehensive Jest tests for the core system fields functionality:
- Tests valid API responses
- Tests invalid response handling
- Tests empty response handling
- Tests field filtering logic
- Tests field transformation

### `load-options.test.js`
Tests for the load options functions that depend on system fields:
- Tests `getLeadCustomFields` function
- Tests `getAvailableCustomFields` function
- Tests error handling and graceful degradation
- Tests field metadata formatting

### `integration.test.js`
Integration tests that simulate the actual n8n environment:
- Tests the complete flow from API call to field processing
- Tests various response scenarios
- Tests field filtering with mixed field types
- Tests property preservation after filtering

## Running Tests

### With Jest (Recommended)
```bash
# Install Jest if not already installed
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only integration tests
npm run test:integration
```

### Manual Testing
The integration test can also be run directly:
```bash
node test/integration.test.js
```

## Test Coverage

The tests cover:
- ✅ Valid API responses (direct array format)
- ✅ Invalid API responses (non-array data)
- ✅ Empty API responses
- ✅ Field filtering logic (excluding PICK_LIST, LOOK_UP, MULTI_PICKLIST)
- ✅ Standard field exclusion
- ✅ Inactive field exclusion
- ✅ Field property transformation
- ✅ Error handling and graceful degradation
- ✅ Cache management
- ✅ Load options functionality

## Expected API Response Format

The `/v1/layouts/leads/system-fields?view=create` endpoint should return a direct array of field objects:

```json
[
  {
    "id": 301,
    "type": "TEXT_FIELD",
    "displayName": "Department Code",
    "name": "departmentCode",
    "active": true,
    "required": false,
    "standard": false,
    "internal": false,
    "systemRequired": false,
    "width": 12,
    "column": 1,
    "row": 1,
    "multiValue": false
  }
]
```

## Verification

To verify the fix works in your n8n environment:
1. Build the project: `npm run build`
2. Install the node in your n8n instance
3. Try to configure a Kylas node with custom fields
4. The parameter options should load without the "fields.filter is not a function" error

## Troubleshooting

If you still encounter issues:
1. Check the browser console for any error messages
2. Verify the API endpoint returns the expected array format
3. Check that your API credentials are valid
4. Ensure the Kylas API is accessible from your n8n instance
