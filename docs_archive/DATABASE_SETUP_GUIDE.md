# Database Setup Guide

This guide will help you set up all required database tables for the system.

## Required SQL Migrations

Run these SQL files in your Supabase SQL Editor in order:

### 1. Core Tables (If not already done)
```sql
-- Run database/01_initial_schema.sql (profiles, lessons, etc.)
-- Run database/02_lessons_schema.sql (lessons table)
```

### 2. Domain Management
```sql
-- Run database/03_domains_schema.sql
-- Creates: domains, departments, sub_domains, semesters tables
```

### 3. Semesters Support
```sql
-- Run database/04_add_semesters_migration.sql
-- Adds semester support to the system
```

### 4. Parent-Children Relationships
```sql
-- Run database/05_parent_children_migration.sql (if exists)
-- Adds parent-child relationship tracking
```

### 5. Lesson Permissions
```sql
-- Run database/08_lesson_permissions.sql (if exists)
-- Adds permission field to lessons (view_only vs allow_download)
```

### 6. Cascade Delete Fix
```sql
-- Run database/09_fix_lessons_cascade.sql
-- Ensures proper cascade delete for lessons when domains are deleted
```

### 7. System Configuration (NEW - REQUIRED)
```sql
-- Run database/10_system_config.sql
-- Creates: system_config and system_backups tables
-- This is REQUIRED for System Configuration page to work
```

## How to Run SQL in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the entire content of the SQL file
6. Paste it into the editor
7. Click "Run" or press Ctrl+Enter
8. Check for success message at the bottom

## Verification

After running all migrations, verify the tables exist:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'profiles',
  'lessons',
  'domains',
  'departments',
  'sub_domains',
  'semesters',
  'system_config',
  'system_backups'
);
```

You should see all 8 tables listed.

## Storage Bucket Setup

For file uploads to work, also run:

```sql
-- Run database/07_create_storage_bucket.sql
-- Creates the 'lesson-files' storage bucket
```

## Troubleshooting

### "relation does not exist" error
- The table hasn't been created yet
- Run the corresponding SQL migration file

### "permission denied" error
- Check RLS policies
- Make sure your user has admin role

### System Config page shows errors
- Run `database/10_system_config.sql`
- Check browser console for specific error messages

### File upload fails
- Run `database/07_create_storage_bucket.sql`
- Check Supabase Storage settings

## Quick Setup (All at Once)

If you want to run everything at once, you can combine all SQL files:

1. Open each SQL file in order (01 through 10)
2. Copy all content
3. Paste into one large SQL query
4. Run it all at once

**Note:** This might fail if there are dependencies. It's safer to run them one by one.
