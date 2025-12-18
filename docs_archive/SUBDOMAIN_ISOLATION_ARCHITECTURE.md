# Subdomain Isolation Architecture - Current Implementation

## ✅ What's Working

### 1. User Creation with Subdomain Isolation
When a user is created in a subdomain:
- `sub_domain_id` is stored in the `profiles` table
- User data is permanently linked to that subdomain
- User cannot access data from other subdomains

**Flow:**
```
Admin selects Subdomain → Creates User → sub_domain_id saved → User isolated to that subdomain
```

### 2. User Filtering by Subdomain
When viewing users:
- Backend query filters: `WHERE sub_domain_id = ?`
- Only users from selected subdomain are displayed
- Prevents cross-subdomain data leakage

**Query:**
```sql
SELECT * FROM profiles WHERE sub_domain_id = $1
```

### 3. Data Isolation
All related data (lessons, assignments, quizzes, etc.) is also filtered by subdomain through RLS policies.

## 📍 Current Locations

### User Creation
- **Location:** `src/pages/Admin/DomainManagement.tsx`
- **Subdomain Selection:** Yes ✅
- **sub_domain_id Passed:** Yes ✅

### User Management/Viewing
- **Location:** `src/pages/Admin/UserManagement.tsx`
- **Subdomain Filtering:** Yes ✅
- **User Creation:** No ❌ (Missing)

## 🔧 What Needs to be Added

### Add User Creation to UserManagement.tsx
Currently, users can only be created from DomainManagement. We should add an "Add User" button to UserManagement that:

1. Uses the currently selected subdomain
2. Creates user with `sub_domain_id` automatically
3. Provides same form as DomainManagement

### Implementation Steps:
1. Add "Add User" button to UserManagement header
2. Create dialog with user creation form
3. Pass `selectedSubDomain.id` as `sub_domain_id`
4. Call `/api/users/create` endpoint
5. Reload users list after creation

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │ DomainManagement │         │ UserManagement   │          │
│  │                  │         │                  │          │
│  │ • Create Domain  │         │ • View Users     │          │
│  │ • Create Subdomain         │ • Edit Users     │          │
│  │ • Create Users ✅          │ • Delete Users   │          │
│  │   (with sub_domain_id)     │ • Create Users ❌│          │
│  └──────────────────┘         └──────────────────┘          │
│         │                              │                    │
│         └──────────────┬───────────────┘                    │
│                        │                                    │
│                        ▼                                    │
│              Backend: /api/users/create                    │
│              - Saves sub_domain_id                         │
│              - Creates auth user                           │
│              - Creates profile                             │
│                        │                                    │
│                        ▼                                    │
│              Database: profiles table                      │
│              - id, email, role, sub_domain_id              │
│              - department, semester, etc.                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Security Considerations

1. **RLS Policies:** All tables have RLS policies that check `sub_domain_id`
2. **Backend Validation:** Server validates `sub_domain_id` before creating user
3. **Frontend Filtering:** UI only shows users from selected subdomain
4. **No Cross-Subdomain Access:** Users cannot see/modify data from other subdomains

## 📝 Summary

**Current Status:** Subdomain isolation is working correctly for user creation and viewing.

**What's Missing:** The ability to create users directly from the UserManagement page (currently only available in DomainManagement).

**Recommendation:** Add user creation functionality to UserManagement.tsx to provide a unified interface for managing users within a subdomain.
