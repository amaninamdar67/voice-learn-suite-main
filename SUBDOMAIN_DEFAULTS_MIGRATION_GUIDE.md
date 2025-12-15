# Subdomain Default Fields Migration Guide

## Issue
The department and semester fields in the subdomain management form are not persisting after save. This is because the database columns `default_department` and `default_semester` don't exist yet in the `sub_domains` table.

## Solution
You need to run a migration in Supabase to add these columns.

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run the Migration SQL
Copy and paste this SQL into the editor:

```sql
-- Add default department and semester columns to sub_domains table
ALTER TABLE sub_domains
ADD COLUMN IF NOT EXISTS default_department VARCHAR(255),
ADD COLUMN IF NOT EXISTS default_semester VARCHAR(255);

-- Add comments for clarity
COMMENT ON COLUMN sub_domains.default_department IS 'Default department assigned to all users in this subdomain';
COMMENT ON COLUMN sub_domains.default_semester IS 'Default semester assigned to all users in this subdomain';
```

### Step 3: Execute the Query
Click the "Run" button (or press Ctrl+Enter)

### Step 4: Verify
You should see a success message. The columns are now added to your database.

## What This Does
- Adds `default_department` column to store the default department for the subdomain
- Adds `default_semester` column to store the default semester for the subdomain
- These values are automatically assigned to all users created in that subdomain
- When editing a subdomain, you can now set and save these default values

## After Migration
1. Refresh your browser
2. Go to Domains > Select a Domain > Edit a Sub-Domain
3. Fill in the Department and Semester fields
4. Click "Save Changes"
5. Edit the same sub-domain again to verify the data persists

## Troubleshooting
If you get an error:
- Make sure you're using the correct Supabase project
- Check that you have admin access to the database
- Try running the query again

## Automatic Check
You can verify the migration was applied by running:
```bash
node backend/check-subdomain-columns.js
```

This will show you which columns exist in the sub_domains table.
