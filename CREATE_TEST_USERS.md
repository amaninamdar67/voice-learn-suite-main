# Create Test Users for Link Account Feature

The Link Account page is working correctly, but there are no users in the database yet. You need to create test users first.

## Option 1: Create Users via Admin Panel (Recommended)

1. Go to `/users` (User Management page)
2. Select a subdomain
3. Click "Add User" button
4. Create test users with different roles:
   - **Student**: John (student@example.com)
   - **Parent**: Mary (parent@example.com)
   - **Mentor**: David (mentor@example.com)

## Option 2: Create Users via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click "Authentication" in the left sidebar
3. Click "Users" tab
4. Click "Add user" button
5. Create users with emails and passwords

Then add their profiles:
1. Click "SQL Editor"
2. Run this SQL:

```sql
-- Create test users in profiles table
INSERT INTO profiles (id, full_name, email, role, sub_domain_id)
VALUES 
  ('student-uuid-1', 'John Student', 'john@example.com', 'student', 'your-subdomain-id'),
  ('parent-uuid-1', 'Mary Parent', 'mary@example.com', 'parent', 'your-subdomain-id'),
  ('mentor-uuid-1', 'David Mentor', 'david@example.com', 'mentor', 'your-subdomain-id');
```

Replace `your-subdomain-id` with an actual subdomain ID from your database.

## Option 3: Quick Test with SQL

Run this in Supabase SQL Editor to create test data:

```sql
-- First, get a subdomain ID
SELECT id FROM subdomains LIMIT 1;

-- Then create test users (replace subdomain-id with actual ID)
INSERT INTO profiles (id, full_name, email, role, sub_domain_id)
VALUES 
  (gen_random_uuid(), 'Student One', 'student1@test.com', 'student', 'subdomain-id'),
  (gen_random_uuid(), 'Student Two', 'student2@test.com', 'student', 'subdomain-id'),
  (gen_random_uuid(), 'Parent One', 'parent1@test.com', 'parent', 'subdomain-id'),
  (gen_random_uuid(), 'Parent Two', 'parent2@test.com', 'parent', 'subdomain-id'),
  (gen_random_uuid(), 'Mentor One', 'mentor1@test.com', 'mentor', 'subdomain-id'),
  (gen_random_uuid(), 'Mentor Two', 'mentor2@test.com', 'mentor', 'subdomain-id');
```

## After Creating Users

1. Refresh the Link Account page (`/link-account`)
2. You should now see:
   - Students in the "Select Student" dropdown
   - Parents in the "Select Parent" dropdown
   - Mentors in the "Select Mentor" dropdown

3. Create links:
   - Link Student 1 with Parent 1
   - Link Student 1 with Mentor 1
   - This will auto-create a Parent-Mentor link

4. Check the dashboards:
   - Parent Dashboard (`/dashboard` as parent) - should show linked children
   - Mentor Dashboard (`/dashboard` as mentor) - should show linked students

## Troubleshooting

**Still no users showing?**
- Make sure users have the correct role: 'student', 'parent', or 'mentor'
- Make sure users have a valid sub_domain_id
- Check that the subdomain exists in the subdomains table

**Can't see the dropdowns?**
- Refresh the page
- Check browser console for errors
- Make sure backend is running on port 3001

**Need to delete test data?**
```sql
DELETE FROM profiles WHERE email LIKE '%@test.com';
```
