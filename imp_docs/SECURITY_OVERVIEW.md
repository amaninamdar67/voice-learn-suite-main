# Security Overview - E-Learning Platform

## 1. Authentication & Authorization

### Frontend Authentication
- **Supabase Auth**: Uses Supabase's built-in authentication system
- **Session Management**: 
  - Persistent sessions stored in `localStorage`
  - Auto-refresh tokens enabled
  - Session detection on app load
  - Real-time auth state changes via `onAuthStateChange` listener

### Backend Authentication
- **Service Role Key**: Backend uses Supabase Service Role Key for admin operations
- **User Context**: All requests validated against authenticated user ID
- **Role-Based Access**: User roles determine what data they can access

### User Roles
- `super_admin` - Full system access, manage domains/subdomains
- `admin` - Domain-level admin, manage users and content
- `teacher` - Create and manage lessons, quizzes, assignments
- `student` - Access learning content, submit assignments
- `parent` - Monitor child's progress, communicate with mentors
- `mentor` - Guide students, monitor community posts

---

## 2. Row Level Security (RLS)

### Database-Level Protection
All sensitive tables have RLS enabled with specific policies:

#### Profiles Table
- Users can only view their own profile
- Admins can view all profiles in their domain
- Super admins can view all profiles

#### Lessons Table
- Teachers can only view/edit their own lessons
- Students can view lessons for their grade/section
- Admins can view all lessons in their domain

#### Parent-Children Relationships
- Parents can only view their own children
- Admins can manage relationships
- Super admins have full access

#### Mentor-Student Links
- Mentors can only view their assigned students
- Students can view their assigned mentors
- Admins manage the linking

#### Community Posts & Replies
- Users can view all posts (public community)
- Users can only edit/delete their own posts
- Admins can moderate content

#### Messaging Tables
- Users can only view messages they're part of
- Sender/receiver validation enforced
- Soft delete support (is_deleted flag)

#### LMS Content (Quizzes, Assignments, Videos)
- Teachers can only manage their own content
- Students can only access assigned content
- Tracking data is user-specific

---

## 3. Frontend Security

### Private Routes
```typescript
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};
```
- All protected pages wrapped with `PrivateRoute`
- Redirects unauthenticated users to login
- Checks `isAuthenticated` from AuthContext

### Role-Based UI
- Sidebar menu items filtered by user role
- Admin-only pages only accessible to admins
- Teacher-only features hidden from students
- Dynamic navigation based on user role

### Domain Isolation
- Users can only access content from their domain
- Domain status checked on login (inactive domains block access)
- Subdomain filtering on all queries

---

## 4. Backend Security

### Service Role Authentication
- Backend uses `SUPABASE_SERVICE_ROLE_KEY` for admin operations
- Separate from frontend's anonymous key
- Allows backend to bypass RLS for specific operations

### API Endpoints
- All endpoints validate user context
- User ID extracted from request and verified
- Cross-user data access prevented

### Data Validation
- Input validation on all endpoints
- Type checking with TypeScript
- Error handling with try-catch blocks

---

## 5. Environment Variables

### Frontend (.env with VITE_ prefix)
```
VITE_SUPABASE_URL          - Supabase project URL
VITE_SUPABASE_ANON_KEY     - Anonymous key (safe for frontend)
VITE_GROQ_API_KEY          - AI voice navigation API
VITE_ALAN_SDK_KEY          - Voice navigation SDK
```

### Backend (.env without prefix)
```
SUPABASE_URL               - Supabase project URL
SUPABASE_ANON_KEY          - Anonymous key
SUPABASE_SERVICE_ROLE_KEY  - Service role key (admin access)
```

### Key Security Points
- Service Role Key never exposed to frontend
- Anonymous key has limited permissions
- Environment variables not committed to git
- `.gitignore` excludes `.env` files

---

## 6. Data Protection

### Encryption in Transit
- HTTPS/TLS for all communications
- Supabase enforces SSL/TLS
- Secure WebSocket connections for real-time features

### Encryption at Rest
- Supabase handles database encryption
- Storage buckets encrypted by default
- Sensitive data (passwords) hashed by Supabase Auth

### Soft Deletes
- Messages support soft delete (is_deleted flag)
- Data not permanently removed
- Audit trail maintained

---

## 7. Storage Security

### Storage Buckets
- Lesson files bucket with access policies
- Teachers can upload their own files
- Public read access for authorized users
- Teachers can only delete their own files

### File Upload Validation
- File type validation on upload
- Size limits enforced
- Virus scanning recommended (not currently implemented)

---

## 8. API Security

### CORS Configuration
```javascript
app.use(cors());
```
- Cross-Origin Resource Sharing enabled
- Allows frontend to communicate with backend

### Request Validation
- JSON body parsing with size limits
- Input sanitization on all endpoints
- Error messages don't expose sensitive info

### Rate Limiting
- Not currently implemented
- Recommended for production

---

## 9. Domain & Subdomain Isolation

### Multi-Tenancy
- Each domain is isolated
- Users belong to specific domains
- Subdomains for organizational structure
- Data queries filtered by domain_id

### Domain Status
- Inactive domains block user access
- Users logged out if domain becomes inactive
- Admin can deactivate domains

---

## 10. Audit & Logging

### System Logs Table
- Tracks system activities
- User actions logged
- Timestamps recorded
- Useful for security audits

### Activity Tracking
- User login/logout events
- Content creation/modification
- Admin actions logged
- Community moderation tracked

---

## 11. Best Practices Implemented

✅ **Authentication**: Supabase Auth with session management
✅ **Authorization**: Role-based access control (RBAC)
✅ **Database Security**: Row Level Security (RLS) policies
✅ **API Security**: User context validation
✅ **Environment Secrets**: Separate keys for frontend/backend
✅ **Data Isolation**: Domain and user-level filtering
✅ **Error Handling**: Try-catch blocks, graceful failures
✅ **Private Routes**: Frontend route protection
✅ **Soft Deletes**: Data preservation with deletion flags

---

## 12. Recommendations for Production

### High Priority
1. **Rate Limiting**: Implement rate limiting on API endpoints
2. **Input Validation**: Add comprehensive input validation library
3. **HTTPS Only**: Enforce HTTPS in production
4. **Secrets Management**: Use proper secrets manager (AWS Secrets Manager, HashiCorp Vault)
5. **File Upload Scanning**: Add virus/malware scanning for uploads

### Medium Priority
1. **API Key Rotation**: Implement regular key rotation
2. **Audit Logging**: Enhanced logging for compliance
3. **Two-Factor Authentication**: Optional 2FA for sensitive accounts
4. **Content Security Policy**: Add CSP headers
5. **SQL Injection Prevention**: Already handled by Supabase, but verify

### Low Priority
1. **DDoS Protection**: Use Cloudflare or similar
2. **Web Application Firewall**: WAF for additional protection
3. **Penetration Testing**: Regular security audits
4. **Security Headers**: Add HSTS, X-Frame-Options, etc.

---

## 13. Security Checklist

- [x] Authentication implemented
- [x] Authorization with roles
- [x] RLS policies on all tables
- [x] Environment variables separated
- [x] Private routes on frontend
- [x] User context validation on backend
- [x] Domain isolation
- [x] Error handling
- [ ] Rate limiting
- [ ] Input validation library
- [ ] File upload scanning
- [ ] 2FA support
- [ ] Security headers
- [ ] Penetration testing

---

## 14. Contact & Support

For security issues or concerns:
1. Review RLS policies in database files
2. Check environment variable configuration
3. Verify user role assignments
4. Test with different user roles
5. Review Supabase security documentation

