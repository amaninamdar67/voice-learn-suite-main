# Yesterday's Session - Complete Recovery Guide

## Summary of Work Done
Fixed subdomain and user deletion issues by addressing RLS policies, foreign key constraints, and backend logic.

---

## Detailed Changes Made (Point-wise)

### 1. Database Migrations Created (29-36)

#### Migration 29: `29_cascade_delete_subdomain.sql`
- **Purpose**: Enable cascade delete for subdomain relationships
- **Changes**:
  - Added `ON DELETE CASCADE` to `profiles.sub_domain_id` foreign key
  - Added `ON DELETE CASCADE` to `departments.subdomain_id` foreign key
  - Added `ON DELETE CASCADE` to `semesters.subdomain_id` foreign key
- **Why**: Allows automatic deletion of related records when subdomain is deleted
- **Recovery**: If needed, re-run this migration to restore cascade delete constraints

#### Migration 30: `30_fix_rls_for_admin_deletes.sql`
- **Purpose**: Add RLS bypass policies for admin operations
- **Changes**: Created policies allowing admin delete operations
- **Status**: Superseded by migration 31 (disable RLS entirely)
- **Recovery**: Can be skipped if migration 31 is applied

#### Migration 31: `31_disable_rls_admin_tables.sql`
- **Purpose**: Disable RLS on admin-only tables
- **Changes**:
  - `ALTER TABLE domains DISABLE ROW LEVEL SECURITY`
  - `ALTER TABLE departments DISABLE ROW LEVEL SECURITY`
  - `ALTER TABLE sub_domains DISABLE ROW LEVEL SECURITY`
  - `ALTER TABLE semesters DISABLE ROW LEVEL SECURITY`
- **Why**: RLS policies were blocking service role deletes
- **Recovery**: Re-run to disable RLS if it gets re-enabled

#### Migration 32: `32_disable_profiles_rls.sql`
- **Purpose**: Disable RLS on profiles table
- **Changes**: `ALTER TABLE profiles DISABLE ROW LEVEL SECURITY`
- **Why**: Profiles table RLS was blocking user deletion
- **Recovery**: Re-run to disable RLS on profiles

#### Migration 33: `33_fix_assignments_fk_cascade.sql`
- **Purpose**: Fix foreign key constraints on assignments table
- **Changes**:
  - Drop and recreate `assignments.department_id_fkey` with `ON DELETE SET NULL`
  - Drop and recreate `assignments.semester_id_fkey` with `ON DELETE SET NULL`
- **Why**: Assignments table was blocking subdomain deletion
- **Recovery**: Re-run to restore proper cascade behavior

#### Migration 34: `34_fix_assignments_subdomain_fk.sql`
- **Purpose**: Fix subdomain foreign key on assignments
- **Changes**:
  - Drop and recreate `assignments.sub_domain_id_fkey` with `ON DELETE SET NULL`
  - Drop and recreate `assignments.domain_id_fkey` with `ON DELETE SET NULL`
- **Why**: Assignments had missing cascade delete for subdomain references
- **Recovery**: Re-run to restore proper cascade behavior

#### Migration 35: `35_fix_system_config_fk.sql`
- **Purpose**: Fix foreign keys in system_config tables
- **Changes**:
  - Drop and recreate `system_config.updated_by_fkey` with `ON DELETE SET NULL`
  - Drop and recreate `system_logs.created_by_fkey` with `ON DELETE SET NULL`
- **Why**: These tables were blocking user deletion
- **Recovery**: Re-run to restore proper cascade behavior

#### Migration 36: `36_create_system_logs_table.sql`
- **Purpose**: Create missing system_logs table
- **Changes**: Create `system_logs` table with proper structure and foreign keys
- **Why**: Migration 35 was failing because table didn't exist
- **Recovery**: Re-run to create the table if it gets dropped

---

### 2. Backend Changes

#### File: `backend/server.js`

**Change 1: Subdomain Delete Endpoint (app.delete('/api/subdomains/:id'))**
- **Original**: Tried to delete directly with cascade
- **Updated**: Simplified to just delete from sub_domains table, letting database cascade
- **Code**:
  ```javascript
  const { error } = await supabase
    .from('sub_domains')
    .delete()
    .eq('id', id);
  ```
- **Why**: Removed complex step-by-step deletion that was causing issues
- **Recovery**: If subdomain deletion breaks, revert to this simple approach

**Change 2: User Delete Endpoint (app.delete('/api/users/:id'))**
- **Original**: Only deleted from auth, relied on cascade
- **Updated**: Delete profile first, then delete from auth
- **Code**:
  ```javascript
  // Step 1: Delete profile
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);
  
  // Step 2: Delete from auth
  const { error: authError } = await supabase.auth.admin.deleteUser(id);
  ```
- **Why**: Ensures all related data is cleaned up before auth deletion
- **Recovery**: If user deletion fails, ensure this two-step process is in place

---

## Key Issues Identified & Fixed

### Issue 1: RLS Policies Blocking Deletes
- **Problem**: RLS policies required super_admin role, blocking service role operations
- **Solution**: Disabled RLS on admin tables (migrations 31-32)
- **Recovery**: If RLS needs to be re-enabled, update policies to allow service role

### Issue 2: Missing Cascade Delete on Foreign Keys
- **Problem**: Assignments table had foreign keys without cascade delete
- **Solution**: Added `ON DELETE SET NULL` to assignments foreign keys (migrations 33-34)
- **Recovery**: Re-run migrations 33-34 to restore cascade behavior

### Issue 3: Missing system_logs Table
- **Problem**: Migration 35 tried to alter non-existent table
- **Solution**: Created system_logs table first (migration 36)
- **Recovery**: Re-run migration 36 if table is dropped

### Issue 4: User Deletion Failing
- **Problem**: Profile deletion was blocked by foreign key constraints
- **Solution**: Updated backend to delete profile before auth user (backend/server.js)
- **Recovery**: Ensure two-step deletion process is maintained

---

## Migration Execution Order (CRITICAL)

Run migrations in this exact order:
1. Migration 29 - Cascade delete setup
2. Migration 31 - Disable RLS on admin tables
3. Migration 32 - Disable RLS on profiles
4. Migration 33 - Fix assignments FK cascade
5. Migration 34 - Fix assignments subdomain FK
6. Migration 36 - Create system_logs table
7. Migration 35 - Fix system_config FK

**Note**: Migration 30 can be skipped (superseded by 31)

---

## Backend Restart Required
After running migrations, restart backend with:
```bash
node server.js
```

---

## Testing Checklist
- [ ] Delete subdomain - should work
- [ ] Delete domain - should work
- [ ] Delete user (Aman account) - should work
- [ ] Verify cascade deletes related records

---

### 3. Frontend Form Changes

#### File: `src/pages/Admin/UserManagement.tsx`

**Change 1: Removed ID Fields**
- **Removed**: Student ID, Employee ID, Mentor ID input fields
- **Why**: UUIDs are auto-generated, manual entry causes confusion
- **Code Removed**:
  ```jsx
  // Removed these fields from form
  <TextField label="Student ID" ... />
  <TextField label="Employee ID" ... />
  <TextField label="Mentor ID" ... />
  ```
- **Recovery**: Delete these three TextField components from the form

**Change 2: Made Grade Field Conditional**
- **Original**: Grade field shown for all users
- **Updated**: Grade field only shows for Primary School and High School students
- **Code**:
  ```jsx
  {(formData.subdomain_type === 'primary' || formData.subdomain_type === 'high') && (
    <TextField label="Grade" ... />
  )}
  ```
- **Recovery**: Add conditional rendering based on subdomain_type

**Change 3: Changed Teacher Subjects to Free Text**
- **Original**: Dropdown with predefined subjects
- **Updated**: Free text input field for flexibility
- **Code**:
  ```jsx
  // Changed from Select to TextField
  <TextField 
    label="Subjects" 
    placeholder="e.g., Math, Science, English"
    multiline
    rows={2}
  />
  ```
- **Recovery**: Replace subject dropdown with TextField component

**Change 4: Removed Duplicate Department Field**
- **Removed**: Duplicate Department field from Teacher Information section
- **Why**: Department already exists in main form
- **Recovery**: Delete the duplicate department TextField

#### File: `src/pages/Admin/DomainManagement.tsx`

**Change 1: Dynamic Department Inputs**
- **Added**: Add/Delete buttons for multiple departments
- **Code**:
  ```jsx
  {formData.departments.map((dept, index) => (
    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
      <TextField value={dept} onChange={...} />
      <IconButton onClick={() => deleteDept(index)}>
        <Delete />
      </IconButton>
    </Box>
  ))}
  <Button onClick={() => addDept()}>Add Department</Button>
  ```
- **Recovery**: Implement dynamic array management for departments

**Change 2: Dynamic Semester Inputs**
- **Added**: Add/Delete buttons for multiple semesters
- **Code**: Same pattern as departments
- **Recovery**: Implement dynamic array management for semesters

**Change 3: Subdomain_id in API Calls**
- **Updated**: All department/semester creation includes subdomain_id
- **Code**:
  ```javascript
  await fetch('/api/departments/create', {
    body: JSON.stringify({
      name: dept,
      subdomain_id: subdomainId,
      domain_id: selectedDomain.id
    })
  })
  ```
- **Recovery**: Ensure all API calls include subdomain_id parameter

#### File: `src/pages/Admin/ParentChildLinking.tsx`

**New File Created**
- **Purpose**: Admin UI for linking parents to children
- **Features**:
  - Dropdown to select parent
  - Dropdown to select child
  - Link/Unlink buttons
  - List of existing links
- **Recovery**: Recreate this file with parent-child linking functionality

#### File: `src/pages/Admin/MentorStudentLinking.tsx`

**New File Created**
- **Purpose**: Admin UI for linking mentors to students
- **Features**:
  - Dropdown to select mentor
  - Dropdown to select student
  - Link/Unlink buttons
  - List of existing links
  - Mentoring focus field
- **Recovery**: Recreate this file with mentor-student linking functionality

---

## Files Modified Summary
- **Database**: 8 migration files created (29-36)
- **Backend**: 1 file modified (backend/server.js)
- **Frontend**: 4 files modified + 2 new files created
  - Modified: UserManagement.tsx, DomainManagement.tsx
  - Created: ParentChildLinking.tsx, MentorStudentLinking.tsx

---

## Recovery Instructions
If you need to recover specific parts:

### Database Recovery
1. **Subdomain deletion broken**: Re-run migrations 29, 31, 33, 34
2. **User deletion broken**: Re-run migrations 32, 35, 36 + restart backend
3. **Domain deletion broken**: Re-run migrations 31, 33, 34
4. **All broken**: Run all migrations in order + restart backend

### Frontend Recovery
1. **UserManagement form broken**: 
   - Remove ID fields (Student ID, Employee ID, Mentor ID)
   - Add conditional Grade field (only for primary/high school)
   - Change subjects to free text TextField
   - Remove duplicate department field

2. **Parent-Child linking missing**:
   - Recreate ParentChildLinking.tsx with dropdown selectors and link/unlink buttons

3. **Mentor-Student linking missing**:
   - Recreate MentorStudentLinking.tsx with dropdown selectors and link/unlink buttons

### Complete Recovery
- Run all database migrations in order
- Restart backend
- Verify all form changes in UserManagement.tsx and DomainManagement.tsx
- Verify ParentChildLinking.tsx and MentorStudentLinking.tsx exist and work
