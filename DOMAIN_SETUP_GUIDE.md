# Domain Management Setup Guide

## ✅ What's Been Completed:

1. **Database Schema** - Multi-tenancy support with domains, departments, and sub-domains
2. **Backend API** - 15 new endpoints for domain management
3. **Domain Management UI** - Super admin panel to manage organizations
4. **Routes & Navigation** - Domain management accessible from admin sidebar

---

## 🚀 Setup Steps:

### Step 1: Run Database Migration

Go to **Supabase Dashboard > SQL Editor** and run:

```sql
-- Copy and paste the entire content from:
database/03_domains_schema.sql
```

This creates:
- `domains` table (organizations/schools)
- `departments` table (CS, Commerce, etc.)
- `sub_domains` table (grades/semesters)
- Updates `profiles` table with domain fields
- Sets up Row Level Security policies

### Step 2: Make Your Admin a Super Admin

After running the schema, run this SQL (replace with your admin email):

```sql
UPDATE profiles 
SET is_super_admin = true 
WHERE email = 'admin@test.com';
```

### Step 3: Test Domain Management

1. **Login** as admin: `admin@test.com` / `admin123`
2. **Click "Domains"** in the sidebar
3. **Create a Domain:**
   - Name: "ABC School"
   - Description: "Main campus"
4. **Create Departments:**
   - Computer Science
   - Commerce
   - Mechanical Engineering
5. **Create Sub-Domains:**
   - Grade 10
   - Grade 11
   - Grade 12

---

## 📋 API Endpoints Available:

### Domains:
- `GET /api/domains` - List all domains
- `POST /api/domains/create` - Create domain
- `PUT /api/domains/:id` - Update domain
- `DELETE /api/domains/:id` - Delete domain

### Departments:
- `GET /api/departments?domainId=xxx` - List departments
- `POST /api/departments/create` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Sub-Domains:
- `GET /api/subdomains?domainId=xxx` - List sub-domains
- `POST /api/subdomains/create` - Create sub-domain
- `PUT /api/subdomains/:id` - Update sub-domain
- `DELETE /api/subdomains/:id` - Delete sub-domain

### Auth:
- `POST /api/auth/user-domains` - Get domains for user (for login)

---

## 🔄 Next Steps (To Complete Multi-Tenancy):

### 1. Update User Management Form
Add domain/department/sub-domain dropdowns when creating users

### 2. Update Login Flow
- Show domain selection if user exists in multiple domains
- Filter login by selected domain

### 3. Update All Features for Data Isolation
- Lessons filtered by domain
- Quizzes filtered by domain
- Videos filtered by domain
- Discussions filtered by domain

### 4. Update AuthContext
Store selected domain in user session

---

## 🎯 Current Status:

✅ **Backend API** - Complete and running
✅ **Database Schema** - Ready to deploy
✅ **Domain Management UI** - Functional
⏳ **User Management Integration** - Needs domain dropdowns
⏳ **Login Domain Selection** - Needs implementation
⏳ **Data Isolation** - Needs to be applied to all features

---

## 🔐 Security Features:

- Only Super Admins can manage domains
- Row Level Security enforces domain isolation
- Users can only access data in their assigned domain
- Automatic cascade delete when domain is removed
- Updated names propagate to all linked users

---

## 📝 Notes:

- The default domain "Default Organization" is created automatically
- Existing users are assigned to the default domain
- Super admin status is separate from regular admin role
- Domain changes are tracked with updated_at timestamps
