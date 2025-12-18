# 🔐 Admin Setup & Authentication Guide

## Current Status: UI Prototype (Mock Authentication)

Right now, the system uses **mock authentication** for UI testing. Anyone can select "Admin" from the dropdown and login. This is intentional for development/testing.

---

## 🚨 For Production Deployment

When you deploy this to production, you'll need proper authentication. Here are the recommended approaches:

---

## ✅ **Option 1: First User Becomes Admin (Recommended)**

### How it works:
1. First person to register becomes the admin
2. Admin can then create other users and assign roles
3. Simple and secure

### Implementation:
```typescript
// In your backend API
async function register(email, password, name) {
  const userCount = await db.users.count();
  
  const role = userCount === 0 ? 'admin' : 'student';
  
  const user = await db.users.create({
    email,
    password: hashPassword(password),
    name,
    role,
  });
  
  return user;
}
```

---

## ✅ **Option 2: Environment Variable Admin**

### How it works:
1. Set admin email in environment variables
2. When that email registers, they get admin role
3. Secure and configurable

### Implementation:
```typescript
// .env file
ADMIN_EMAIL=admin@yourschool.com

// In your backend
async function register(email, password, name) {
  const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'student';
  
  const user = await db.users.create({
    email,
    password: hashPassword(password),
    name,
    role,
  });
  
  return user;
}
```

---

## ✅ **Option 3: Database Seed Script**

### How it works:
1. Run a script to create the first admin
2. Admin credentials are set during deployment
3. Most secure for production

### Implementation:
```typescript
// seed-admin.ts
import { db } from './database';
import { hashPassword } from './auth';

async function seedAdmin() {
  const adminExists = await db.users.findOne({ role: 'admin' });
  
  if (!adminExists) {
    await db.users.create({
      email: 'admin@yourschool.com',
      password: hashPassword('ChangeThisPassword123!'),
      name: 'System Administrator',
      role: 'admin',
    });
    
    console.log('✅ Admin user created!');
    console.log('Email: admin@yourschool.com');
    console.log('Password: ChangeThisPassword123!');
    console.log('⚠️  CHANGE THIS PASSWORD IMMEDIATELY!');
  }
}

seedAdmin();
```

Run this once during deployment:
```bash
npm run seed:admin
```

---

## 🎓 **Student ID System**

### Current Implementation:
The UI now has a Student ID field in the User Management page.

### For Production:

#### **Auto-Generated Student IDs:**
```typescript
// Backend function
function generateStudentId(year: number, branch: string) {
  const branchCode = {
    'Computer Science': 'CS',
    'Engineering': 'EN',
    'Mathematics': 'MA',
  }[branch] || 'GN';
  
  const count = await db.users.count({ 
    role: 'student',
    createdAt: { $gte: new Date(year, 0, 1) }
  });
  
  const id = `STU${year}${branchCode}${String(count + 1).padStart(4, '0')}`;
  // Example: STU2024CS0001
  
  return id;
}
```

#### **Manual Student IDs:**
Admin can enter custom IDs when creating students in the User Management page.

---

## 🔒 **Recommended Production Setup**

### **1. Backend Authentication (Required)**

```typescript
// auth.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function login(email: string, password: string) {
  // Find user in database
  const user = await db.users.findOne({ email });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Verify password
  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user.id, 
      role: user.role,
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  };
}
```

### **2. Role-Based Access Control**

```typescript
// middleware/auth.ts
export function requireRole(allowedRoles: UserRole[]) {
  return (req, res, next) => {
    const user = req.user; // From JWT token
    
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  };
}

// Usage in routes
app.get('/api/users', 
  authenticate, 
  requireRole(['admin']), 
  getUsersHandler
);
```

### **3. Update Frontend AuthContext**

```typescript
// src/contexts/AuthContext.tsx
const login = async (email: string, password: string, role?: UserRole) => {
  // Call your backend API
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const { token, user } = await response.json();
  
  // Store token
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  setUser(user);
};
```

---

## 📋 **Deployment Checklist**

### **Before Going Live:**

- [ ] Remove role selector from login page (role comes from database)
- [ ] Implement proper password hashing (bcrypt)
- [ ] Set up JWT authentication
- [ ] Create first admin user (using one of the methods above)
- [ ] Set up environment variables
- [ ] Implement password reset functionality
- [ ] Add email verification
- [ ] Set up rate limiting on login endpoint
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Implement session timeout
- [ ] Add audit logging for admin actions

---

## 🎯 **Quick Start for Testing (Current UI)**

### **Right Now (Development):**

1. **Login as Admin:**
   - Email: anything@example.com
   - Password: anything
   - Role: Select "Admin" from dropdown
   - Click Sign In

2. **Create Users:**
   - Go to User Management
   - Click "Add User"
   - Fill in details including Student ID
   - Select role
   - Save

3. **Test Different Roles:**
   - Logout
   - Login again with different role selected

---

## 🔐 **Security Best Practices**

### **For Production:**

1. **Passwords:**
   - Minimum 8 characters
   - Require uppercase, lowercase, number, special char
   - Hash with bcrypt (cost factor 12+)
   - Never store plain text passwords

2. **Admin Access:**
   - Require 2FA for admin accounts
   - Log all admin actions
   - Limit admin account creation
   - Regular security audits

3. **Student IDs:**
   - Make them unique (database constraint)
   - Don't use sequential numbers (predictable)
   - Consider adding check digits
   - Allow admin to regenerate if needed

4. **Session Management:**
   - Use secure, httpOnly cookies
   - Implement session timeout
   - Allow users to view active sessions
   - Provide logout from all devices

---

## 📞 **Next Steps**

### **When Ready for Backend:**

1. **Choose your tech stack:**
   - Node.js + Express + PostgreSQL
   - Python + Django + PostgreSQL
   - Java + Spring Boot + MySQL
   - etc.

2. **I can help you implement:**
   - Complete authentication system
   - Database schema
   - API endpoints
   - Role-based access control
   - Student ID generation
   - Admin user creation

3. **Just share:**
   - Your preferred backend technology
   - Database choice
   - Hosting platform
   - Any specific requirements

---

## 🎉 **Summary**

**Current State:** UI prototype with mock auth (for testing)

**For Production:** Need to implement:
- Real authentication (JWT/sessions)
- Password hashing
- Admin user creation (first user or env variable)
- Student ID system (auto-generate or manual)
- Role-based access control

**Ready to help** when you want to add the backend! 🚀
