# Subdomain User Creation - Fix Applied

## Issue
When creating users from the DomainManagement page, the backend was throwing an error:
```
Could not find the 'semester' column of 'profiles' in the schema cache
```

## Root Cause
The profiles table schema had `semester_id` (UUID foreign key) and `department_id` (UUID foreign key), but the frontend was sending `semester` and `department` as text fields. This mismatch caused the error.

## Solution Applied

### 1. Database Migration (database/41_add_text_dept_sem_to_profiles.sql)
Added two new TEXT columns to the profiles table:
```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS semester text;
```

This allows storing department and semester as simple text values without foreign key references, enabling flexibility for users to enter any department/semester name.

### 2. Backend Update (backend/server.js)
Modified the user creation endpoint to not send `department_id` and `semester_id`:
```javascript
// Before: Sent department_id and semester_id
// After: Only sends sub_domain_id and lets profile data handle department/semester
```

## How It Works Now

1. **User Creation Flow**:
   - Admin clicks "Add Users" on a subdomain card
   - Form opens with department and semester fields pre-filled from subdomain
   - Admin can edit these text fields
   - User is created with:
     - `sub_domain_id`: Links to the subdomain
     - `department`: Text field (e.g., "Computer Science")
     - `semester`: Text field (e.g., "Fall 2024")

2. **Data Isolation**:
   - Users created in a subdomain have `sub_domain_id` set
   - All user data is filtered by `sub_domain_id` in queries
   - Each subdomain has its own isolated user list

## Files Modified
- `backend/server.js` - Updated user creation endpoint
- `database/41_add_text_dept_sem_to_profiles.sql` - New migration file

## Next Steps
1. Run the migration: `database/41_add_text_dept_sem_to_profiles.sql`
2. Test user creation from DomainManagement page
3. Verify data isolation works correctly

## Notes
- The old `department_id` and `semester_id` columns still exist but are not used
- Can be cleaned up later if needed
- Department and semester are now flexible text fields, not tied to specific tables
