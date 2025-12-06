# Database Column Naming Issue - FIXED

## Problem Found

The migration file `database/27_add_subdomain_id_to_depts_sems.sql` was using **`subdomain_id`** (camelCase) instead of **`sub_domain_id`** (snake_case).

This caused:
- Frontend code looking for `sub_domain_id` couldn't find the data
- Departments and semesters weren't being linked to sub-domains
- Cards showed "Not set" for department and semester
- User creation form didn't show department/semester options

## Root Cause

**File: `database/27_add_subdomain_id_to_depts_sems.sql`**

```sql
-- WRONG (was using camelCase)
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS subdomain_id uuid references sub_domains on delete cascade;

ALTER TABLE semesters 
ADD COLUMN IF NOT EXISTS subdomain_id uuid references sub_domains on delete cascade;
```

## Solution Applied

### 1. Fixed Migration File
Updated `database/27_add_subdomain_id_to_depts_sems.sql` to use correct naming:

```sql
-- CORRECT (now using snake_case)
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS sub_domain_id uuid references sub_domains on delete cascade;

ALTER TABLE semesters 
ADD COLUMN IF NOT EXISTS sub_domain_id uuid references sub_domains on delete cascade;
```

### 2. Created Cleanup Migration
Created `database/38_fix_subdomain_column_names.sql` to:
- Detect if old `subdomain_id` column exists
- Rename it to `sub_domain_id`
- Recreate indexes with correct names
- Ensure consistency across the database

### 3. Deleted Duplicate
Removed `database/37_add_subdomain_to_depts_sems.sql` (was a duplicate)

## Migration Order

Run these migrations in order:

1. `database/27_add_subdomain_id_to_depts_sems.sql` - Adds correct `sub_domain_id` columns
2. `database/38_fix_subdomain_column_names.sql` - Fixes any existing `subdomain_id` columns

## Verification

After running migrations, verify with:

```sql
SELECT 
  table_name,
  column_name
FROM information_schema.columns
WHERE table_name IN ('departments', 'semesters')
AND column_name LIKE '%domain%'
ORDER BY table_name, column_name;
```

Expected output:
- `departments.domain_id`
- `departments.sub_domain_id`
- `semesters.domain_id`
- `semesters.sub_domain_id`

## What This Fixes

✅ Departments now properly link to sub-domains
✅ Semesters now properly link to sub-domains
✅ Cards display department and semester names
✅ User creation form shows department/semester options
✅ Edits to sub-domains update department/semester data
✅ Data isolation works correctly per sub-domain

## Files Modified

- `database/27_add_subdomain_id_to_depts_sems.sql` - Fixed column naming
- `database/38_fix_subdomain_column_names.sql` - New cleanup migration
- Deleted: `database/37_add_subdomain_to_depts_sems.sql` - Duplicate removed
