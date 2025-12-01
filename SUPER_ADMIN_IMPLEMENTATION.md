# Super Admin Implementation

## Overview
Implemented a hierarchical admin system with Super Admin role that has elevated privileges over regular admins.

## Role Hierarchy
```
Super Admin (highest)
    ↓
Admin
    ↓
Teacher / Mentor
    ↓
Student / Parent (lowest)
```

## Key Features

### 1. Super Admin Role
- New role: `super_admin`
- Database field: `is_super_admin` boolean flag
- Can perform all admin actions PLUS:
  - Delete other admins
  - Delete super admins
  - Full system control

### 2. Admin Restrictions
Regular admins **CANNOT**:
- ❌ Delete other admins
- ❌ Delete super admins
- ❌ Delete themselves

Regular admins **CAN**:
- ✅ Delete teachers, students, parents, mentors
- ✅ Edit all users
- ✅ Create new users
- ✅ Reset passwords

### 3. Super Admin Privileges
Super admins **CAN**:
- ✅ Delete ANY user (including other admins)
- ✅ Delete other super admins
- ✅ All regular admin functions
- ❌ Cannot delete themselves (safety measure)

## Database Changes

### Migration File
`database/20_add_super_admin_role.sql`

### Schema Updates
```sql
-- Added super_admin to role enum
ALTER TYPE user_role ADD VALUE 'super_admin';

-- Added is_super_admin flag
ALTER TABLE profiles 
ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;

-- Created index for performance
CREATE INDEX idx_profiles_is_super_admin 
ON profiles(is_super_admin) WHERE is_super_admin = TRUE;
```

### Database Functions
```sql
-- Check if user is super admin
CREATE FUNCTION is_super_admin(user_id UUID) RETURNS BOOLEAN

-- Prevent unauthorized admin deletions
CREATE FUNCTION check_admin_delete_permission() RETURNS TRIGGER
```

### Trigger
```sql
-- Enforces deletion rules at database level
CREATE TRIGGER prevent_admin_deletion
  BEFORE DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_admin_delete_permission();
```

## Frontend Implementation

### Type Updates
```typescript
// src/types/index.ts
export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent' | 'mentor';

// src/lib/supabase.ts
export interface Profile {
  // ... other fields
  is_super_admin?: boolean;
}
```

### Delete Logic
```typescript
const handleDeleteUser = async (userId: string) => {
  // 1. Prevent self-deletion
  if (userId === currentUser?.id) {
    setError('You cannot delete your own account!');
    return;
  }

  // 2. Check if deleting admin
  if (userToDelete.role === 'admin' || userToDelete.role === 'super_admin') {
    // Only super admins can delete admins
    const isSuperAdmin = currentUserData?.role === 'super_admin' || 
                         currentUserData?.is_super_admin;
    
    if (!isSuperAdmin) {
      setError('Only Super Admins can delete admin users!');
      return;
    }
  }

  // 3. Proceed with deletion
  // ...
};
```

### UI Indicators

#### Role Badge Colors
```typescript
const getRoleColor = (role: UserRole) => {
  const colors = {
    super_admin: 'secondary',  // Purple
    admin: 'error',            // Red
    teacher: 'primary',        // Blue
    student: 'success',        // Green
    parent: 'warning',         // Orange
    mentor: 'info',            // Cyan
  };
  return colors[role];
};
```

#### Conditional Delete Menu
```typescript
// Show delete option only if:
// 1. Not yourself
// 2. Target is not admin OR you're super admin
{menuUser && menuUser.id !== currentUser?.id && (
  (menuUser.role !== 'admin' && menuUser.role !== 'super_admin') ||
  (currentUserData?.role === 'super_admin')
) && (
  <MenuItem onClick={() => handleDeleteUser(menuUser.id)}>
    Delete User
  </MenuItem>
)}

// Show disabled option with explanation
{menuUser && menuUser.role === 'admin' && !isSuperAdmin && (
  <MenuItem disabled>
    <ListItemText secondary="Only Super Admins can delete admins">
      Delete User
    </ListItemText>
  </MenuItem>
)}
```

## Security Layers

### Layer 1: Frontend Validation
- Check user role before showing delete option
- Validate permissions before API call
- Show appropriate error messages

### Layer 2: Backend API
- Verify user permissions
- Validate deletion request
- Return appropriate errors

### Layer 3: Database Trigger
- Final enforcement at database level
- Cannot be bypassed
- Prevents direct SQL deletions

## Setup Instructions

### 1. Run Migration
```bash
# Connect to your Supabase database
psql -h your-db-host -U postgres -d your-database

# Run the migration
\i database/20_add_super_admin_role.sql
```

### 2. Assign First Super Admin
The migration automatically marks the first admin as super admin. To manually change:

```sql
-- Make a specific user super admin
UPDATE profiles
SET is_super_admin = TRUE
WHERE email = 'admin@example.com';

-- Remove super admin status
UPDATE profiles
SET is_super_admin = FALSE
WHERE email = 'old-admin@example.com';
```

### 3. Verify Setup
```sql
-- Check super admins
SELECT id, full_name, email, role, is_super_admin
FROM profiles
WHERE is_super_admin = TRUE OR role = 'super_admin';
```

## Testing

### Test Cases

#### 1. Super Admin Can Delete Admin
- ✅ Login as super admin
- ✅ Go to User Management
- ✅ Click delete on an admin user
- ✅ Confirm deletion
- ✅ User should be deleted

#### 2. Admin Cannot Delete Admin
- ✅ Login as regular admin
- ✅ Go to User Management
- ✅ Click menu on admin user
- ✅ Delete option should be disabled
- ✅ Shows message: "Only Super Admins can delete admins"

#### 3. Cannot Delete Yourself
- ✅ Login as any admin
- ✅ Try to delete your own account
- ✅ Delete option should be disabled
- ✅ Shows message: "Cannot delete your own account"

#### 4. Admin Can Delete Non-Admins
- ✅ Login as regular admin
- ✅ Delete teacher/student/parent/mentor
- ✅ Should work normally

#### 5. Database Trigger Protection
```sql
-- Try to delete admin as non-super-admin (should fail)
DELETE FROM profiles WHERE role = 'admin' LIMIT 1;
-- Error: Only super admins can delete admin users
```

## User Experience

### For Super Admins
- See all delete options
- Can manage entire system
- Purple "Super Admin" badge
- Full control over user management

### For Regular Admins
- Cannot delete other admins
- See disabled delete option with explanation
- Red "Admin" badge
- Can manage non-admin users

### For All Users
- Cannot delete themselves
- Clear error messages
- Visual indicators of role hierarchy
- Intuitive permission system

## Best Practices

### 1. Limit Super Admins
- Only 1-2 super admins per organization
- Super admins should be trusted personnel
- Regular audits of super admin accounts

### 2. Regular Admin Usage
- Most admin tasks don't need super admin
- Use regular admins for day-to-day operations
- Escalate to super admin only when needed

### 3. Audit Trail
Consider adding:
```sql
-- Log admin deletions
CREATE TABLE admin_deletion_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deleted_user_id UUID,
  deleted_by_user_id UUID,
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT
);
```

### 4. Recovery Plan
- Always have at least 2 super admins
- Keep super admin credentials secure
- Have a process to recover if locked out

## Troubleshooting

### Issue: No Super Admin Exists
```sql
-- Manually create super admin
UPDATE profiles
SET is_super_admin = TRUE
WHERE email = 'your-email@example.com';
```

### Issue: Cannot Delete Admin
- Verify you're logged in as super admin
- Check `is_super_admin` flag in database
- Check browser console for errors

### Issue: Trigger Not Working
```sql
-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'prevent_admin_deletion';

-- Recreate trigger if needed
DROP TRIGGER IF EXISTS prevent_admin_deletion ON profiles;
CREATE TRIGGER prevent_admin_deletion
  BEFORE DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_admin_delete_permission();
```

## Summary

The super admin system provides:
- ✅ Hierarchical role management
- ✅ Protection against accidental admin deletion
- ✅ Clear permission boundaries
- ✅ Multiple security layers
- ✅ Intuitive user interface
- ✅ Database-level enforcement

This ensures system stability and prevents unauthorized access to critical admin functions.
