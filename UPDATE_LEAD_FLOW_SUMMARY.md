# UpdateLead Read-Modify-Write Implementation

## Overview

Successfully implemented a read-modify-write pattern for the `updateLead` function to ensure data preservation and safer updates. The new flow fetches existing lead data before applying updates, preventing accidental data loss.

## Changes Made

### 1. Fixed `getLead` Function
**Before:**
```typescript
const response = await kylasApiRequest.call(this, 'GET', `/v1/leads/${leadId}`, {});
return JSON.parse(response.data as string) as IDataObject;
```

**After:**
```typescript
const response = await kylasApiRequest.call(this, 'GET', `/v1/leads/${leadId}`, {});
return response.data as IDataObject;
```

### 2. Implemented Read-Modify-Write Pattern in `updateLead`

#### New Flow Steps:

**Step 1: Fetch Existing Lead Data**
```typescript
let existingLead: IDataObject;
try {
    existingLead = await getLead.call(this, itemIndex);
} catch (error) {
    throw new ApplicationError(`Failed to fetch existing lead with ID ${leadId}: ${error.message}`);
}
```

**Step 2: Merge Existing Data with Updates**
```typescript
const body: IDataObject = {
    ...existingLead,
    ...updateFields,
};
```

**Step 3: Handle Custom Fields Merging**
```typescript
// Start with existing custom field values, then merge with updates
const existingCustomFields = (existingLead.customFieldValues as IDataObject) || {};
body.customFieldValues = { ...existingCustomFields };

// Process new/updated custom fields with proper type handling
if (customFields.length > 0) {
    customFields.forEach(field => {
        // ... existing custom field processing logic
    });
}
```

**Step 4: Exclude System-Generated Fields**
```typescript
// Remove system-generated fields that shouldn't be updated
const fieldsToExclude = ['id', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'];
fieldsToExclude.forEach(field => {
    delete body[field];
});
```

**Step 5: Send PUT Request with Merged Data**
```typescript
const response = await kylasApiRequest.call(this, 'PUT', `/v1/leads/${leadId}`, body);
return response.data as IDataObject;
```

### 3. Enhanced Logging
Added comprehensive logging for debugging:
```typescript
console.log('updateLead - Read-Modify-Write process:');
console.log('- Existing lead ID:', leadId);
console.log('- Update fields:', updateFields);
console.log('- Custom fields updates:', customFields.length);
console.log('- Final merged body keys:', Object.keys(body));
```

### 4. Fixed Cache Implementation
- Enabled cache duration checking in `getCachedSystemFields`
- Fixed response data handling to use direct data access
- Improved error logging

## Benefits

### 1. **Data Preservation**
- **Before**: Only sent fields specified in the update, potentially clearing unspecified fields
- **After**: Preserves all existing data and only updates specified fields

### 2. **Custom Fields Safety**
- **Before**: Replaced entire `customFieldValues` object
- **After**: Merges existing custom fields with new/updated ones

### 3. **Error Handling**
- **Before**: No validation that lead exists before update
- **After**: Validates lead exists and provides clear error messages

### 4. **System Field Protection**
- **Before**: Could accidentally include system fields in update
- **After**: Automatically excludes read-only system fields

### 5. **Better Debugging**
- **Before**: Limited logging
- **After**: Comprehensive logging of the read-modify-write process

## Example Scenarios

### Scenario 1: Partial Field Update
**Input:**
- Existing Lead: `{ name: "John Doe", email: "john@example.com", phone: "123", customFieldValues: { dept: "Sales" } }`
- Update: `{ name: "John Smith" }`

**Before (Old Flow):**
- Request Body: `{ name: "John Smith" }`
- Risk: Other fields might be cleared depending on API behavior

**After (New Flow):**
- Request Body: `{ name: "John Smith", email: "john@example.com", phone: "123", customFieldValues: { dept: "Sales" } }`
- Result: Only name updated, all other data preserved

### Scenario 2: Custom Field Update
**Input:**
- Existing Custom Fields: `{ department: "Sales", region: "North" }`
- Update: `{ department: "Marketing" }`

**Before (Old Flow):**
- Custom Fields: `{ department: "Marketing" }`
- Risk: `region` field lost

**After (New Flow):**
- Custom Fields: `{ department: "Marketing", region: "North" }`
- Result: Only department updated, region preserved

### Scenario 3: Non-existent Lead
**Before (Old Flow):**
- Would attempt PUT request and fail with unclear error

**After (New Flow):**
- Fails fast with clear error: "Failed to fetch existing lead with ID 12345: Lead not found"

## Performance Considerations

### Additional API Call
- **Trade-off**: One additional GET request per update
- **Benefit**: Significantly reduced risk of data loss
- **Mitigation**: GET requests are typically fast and cacheable

### Memory Usage
- **Impact**: Minimal - temporarily stores existing lead data
- **Benefit**: Complete data integrity

## Testing

### Verification
- ✅ `npm run lint` - No linting errors
- ✅ `npm run build` - Successful build
- ✅ Logic tests - All scenarios verified

### Test Coverage
- ✅ Data merging logic
- ✅ Custom fields preservation
- ✅ System fields exclusion
- ✅ Error handling for non-existent leads
- ✅ Parameter extraction and processing

## Migration Notes

### Backward Compatibility
- **No Breaking Changes**: Existing workflows continue to work
- **Enhanced Safety**: Updates are now safer by default
- **Same API**: No changes to node parameters or interface

### Performance Impact
- **Minimal**: One additional GET request per update
- **Acceptable**: Trade-off for data safety is worthwhile
- **Optimizable**: Could add caching if needed in the future

## Future Enhancements

1. **Conditional Updates**: Only send changed fields to reduce payload size
2. **Optimistic Locking**: Use version fields to prevent concurrent update conflicts
3. **Batch Updates**: Support updating multiple leads efficiently
4. **Field-Level Permissions**: Respect field-level update permissions
5. **Audit Trail**: Log what fields were changed for compliance

## Conclusion

The read-modify-write pattern implementation significantly improves the safety and reliability of lead updates while maintaining backward compatibility. The additional GET request overhead is minimal compared to the data integrity benefits gained.
