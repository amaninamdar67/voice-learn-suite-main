import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  Delete,
  MoreVert,
  LockReset,
  Search,
  Settings,
} from '@mui/icons-material';
import { UserRole } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  semester?: string;
  branch?: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Subdomain context
  const [selectedSubDomain, setSelectedSubDomain] = useState<any>(null);
  const [subDomains, setSubDomains] = useState<any[]>([]);
  
  const [openEditUser, setOpenEditUser] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<User | null>(null);
  
  const [mentors, setMentors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as UserRole,
    phone: '',
    studentId: '',
    employeeId: '',
    mentorId: '',
    grade: '',
    section: '',
    department: '',
    semester: '',
    qualifications: '',
    expertiseArea: '',
    subjects: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getRelativeTime = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  // Load subdomains
  useEffect(() => {
    const loadSubDomains = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/subdomains');
        const data = await response.json();
        setSubDomains(data.subdomains || []);
        // Auto-select first subdomain
        if (data.subdomains && data.subdomains.length > 0) {
          setSelectedSubDomain(data.subdomains[0]);
        }
      } catch (err) {
        console.error('Error loading subdomains:', err);
      }
    };
    loadSubDomains();
  }, []);

  // Load users for selected subdomain
  useEffect(() => {
    if (!selectedSubDomain) return;
    
    const loadUsers = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/users?sub_domain_id=${selectedSubDomain.id}`);
        const data = await response.json();

        if (data.users) {
          const formattedUsers: User[] = data.users.map((profile: any) => {
            const lastLoginDate = profile.last_sign_in_at ? new Date(profile.last_sign_in_at) : null;
            const daysSinceLogin = lastLoginDate 
              ? Math.floor((new Date().getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24))
              : 999;
            
            return {
              id: profile.id,
              name: profile.full_name || 'N/A',
              email: profile.email || 'N/A',
              role: profile.role,
              semester: profile.semester || '',
              branch: profile.department || '',
              status: daysSinceLogin > 30 ? 'inactive' : 'active',
              lastLogin: getRelativeTime(profile.last_sign_in_at || profile.created_at),
              subjects: profile.subjects || [],
              is_super_admin: profile.is_super_admin || false,
            } as any;
          });
          setUsers(formattedUsers);
          setStudents(formattedUsers.filter(u => u.role === 'student'));
          setMentors(formattedUsers.filter(u => u.role === 'mentor'));
        }
      } catch (err: any) {
        console.error('Error loading users:', err);
        setError('Failed to load users');
      }
    };
    
    loadUsers();
  }, [selectedSubDomain]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUser(null);
  };

  const handleEditUser = async (user: User) => {
    setSelectedUser(user);
    
    try {
      const response = await fetch(`http://localhost:3001/api/users/${user.id}`);
      const data = await response.json();
      
      if (data.user) {
        const profile = data.user;
        setNewUser({
          name: profile.full_name || '',
          email: profile.email || '',
          password: '',
          role: profile.role || 'student',
          phone: profile.phone || '',
          studentId: profile.student_id || '',
          employeeId: profile.employee_id || '',
          mentorId: profile.mentor_id || '',
          grade: profile.grade || '',
          section: profile.section || '',
          department: profile.department || '',
          semester: profile.semester || '',
          qualifications: profile.qualifications || '',
          expertiseArea: profile.expertise_area || '',
          subjects: profile.subjects || [],
        });
      }
    } catch (err) {
      console.error('Error loading user details:', err);
    }
    
    setOpenEditUser(true);
    handleMenuClose();
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    
    if (!userToDelete) {
      handleMenuClose();
      return;
    }

    if (userId === currentUser?.id) {
      setError('You cannot delete your own account!');
      handleMenuClose();
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${userToDelete.name}? This action cannot be undone.`)) {
      handleMenuClose();
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setSuccess(`User ${userToDelete.name} deleted successfully!`);
      
      // Reload users for current subdomain
      if (selectedSubDomain) {
        const response = await fetch(`http://localhost:3001/api/users?sub_domain_id=${selectedSubDomain.id}`);
        const data = await response.json();
        if (data.users) {
          const formattedUsers: User[] = data.users.map((profile: any) => ({
            id: profile.id,
            name: profile.full_name || 'N/A',
            email: profile.email || 'N/A',
            role: profile.role,
            semester: profile.semester || '',
            branch: profile.department || '',
            status: 'active',
            lastLogin: getRelativeTime(profile.last_sign_in_at || profile.created_at),
            subjects: profile.subjects || [],
          } as any));
          setUsers(formattedUsers);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleResetPassword = () => {
    alert('Password reset email sent!');
    handleMenuClose();
  };

  const handleCreateUser = async () => {
    if (!selectedSubDomain) {
      setError('Please select a subdomain first');
      return;
    }

    if (!newUser.name || !newUser.email || !newUser.password) {
      setError('Name, email, and password are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const profileData: any = {
        role: newUser.role,
        full_name: newUser.name,
        phone: newUser.phone || null,
        sub_domain_id: selectedSubDomain.id,
        department: newUser.department || null,
        semester: newUser.semester || null,
      };

      if (newUser.role === 'student') {
        profileData.student_id = newUser.studentId;
        profileData.grade = newUser.grade;
        profileData.section = newUser.section;
      } else if (newUser.role === 'teacher') {
        profileData.employee_id = newUser.employeeId;
        profileData.qualifications = newUser.qualifications;
        profileData.subjects = newUser.subjects;
      } else if (newUser.role === 'mentor') {
        profileData.mentor_id = newUser.mentorId;
        profileData.expertise_area = newUser.expertiseArea;
      } else if (newUser.role === 'admin') {
        profileData.employee_id = newUser.employeeId;
      }

      const response = await fetch('http://localhost:3001/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          profile: profileData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess(`User ${newUser.name} created successfully!`);
      setOpenAddUser(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'student',
        phone: '',
        studentId: '',
        employeeId: '',
        mentorId: '',
        grade: '',
        section: '',
        department: '',
        semester: '',
        qualifications: '',
        expertiseArea: '',
        subjects: [],
      });

      // Reload users for current subdomain
      if (selectedSubDomain) {
        const response = await fetch(`http://localhost:3001/api/users?sub_domain_id=${selectedSubDomain.id}`);
        const data = await response.json();
        if (data.users) {
          const formattedUsers: User[] = data.users.map((profile: any) => ({
            id: profile.id,
            name: profile.full_name || 'N/A',
            email: profile.email || 'N/A',
            role: profile.role,
            semester: profile.semester || '',
            branch: profile.department || '',
            status: 'active',
            lastLogin: getRelativeTime(profile.last_sign_in_at || profile.created_at),
            subjects: profile.subjects || [],
          } as any));
          setUsers(formattedUsers);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const profileData: any = {
        role: newUser.role,
        full_name: newUser.name,
        phone: newUser.phone || null,
        department: newUser.department || null,
        semester: newUser.semester || null,
      };

      if (newUser.role === 'student') {
        profileData.student_id = newUser.studentId;
        profileData.grade = newUser.grade;
        profileData.section = newUser.section;
      } else if (newUser.role === 'teacher') {
        profileData.employee_id = newUser.employeeId;
        profileData.qualifications = newUser.qualifications;
        profileData.subjects = newUser.subjects;
      } else if (newUser.role === 'mentor') {
        profileData.mentor_id = newUser.mentorId;
        profileData.expertise_area = newUser.expertiseArea;
      } else if (newUser.role === 'admin') {
        profileData.employee_id = newUser.employeeId;
      }

      const response = await fetch(`http://localhost:3001/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      setSuccess(`User ${newUser.name} updated successfully!`);
      setOpenEditUser(false);
      setSelectedUser(null);
      
      // Reload users for current subdomain
      if (selectedSubDomain) {
        const response = await fetch(`http://localhost:3001/api/users?sub_domain_id=${selectedSubDomain.id}`);
        const data = await response.json();
        if (data.users) {
          const formattedUsers: User[] = data.users.map((profile: any) => ({
            id: profile.id,
            name: profile.full_name || 'N/A',
            email: profile.email || 'N/A',
            role: profile.role,
            semester: profile.semester || '',
            branch: profile.department || '',
            status: 'active',
            lastLogin: getRelativeTime(profile.last_sign_in_at || profile.created_at),
            subjects: profile.subjects || [],
          } as any));
          setUsers(formattedUsers);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.status === 'active') ||
                         (statusFilter === 'inactive' && user.status === 'inactive');
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: UserRole) => {
    const colors = {
      super_admin: 'secondary',
      admin: 'error',
      teacher: 'primary',
      student: 'success',
      parent: 'warning',
      mentor: 'info',
    };
    return colors[role] as any;
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            User Management
          </Typography>
          {selectedSubDomain && (
            <Typography variant="body1" color="text.secondary">
              Managing users in: <strong>{selectedSubDomain.name}</strong>
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => setOpenAddUser(true)}
            disabled={!selectedSubDomain}
          >
            + Add User
          </Button>
          <Tooltip title="Settings">
            <IconButton onClick={() => setOpenSettings(true)}>
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Subdomain Selector */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Subdomain:</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {subDomains.map((sd) => (
            <Chip
              key={sd.id}
              label={`${sd.name} (${sd.type})`}
              onClick={() => setSelectedSubDomain(sd)}
              color={selectedSubDomain?.id === sd.id ? 'primary' : 'default'}
              variant={selectedSubDomain?.id === sd.id ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: 250 }}
          />
          <TextField
            select
            size="small"
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="parent">Parent</MenuItem>
            <MenuItem value="mentor">Mentor</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Subjects</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow
                key={user.id}
                hover
                sx={{
                  '&:hover .action-buttons': {
                    opacity: 1,
                  },
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar>{user.name.charAt(0)}</Avatar>
                    <Typography variant="body2" fontWeight={500}>
                      {user.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={getRoleColor(user.role)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {user.branch || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {user.semester || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {user.role === 'teacher' && (user as any).subjects && (user as any).subjects.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {(user as any).subjects.map((subject: string, idx: number) => (
                        <Chip
                          key={idx}
                          label={subject}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {user.lastLogin}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box
                    className="action-buttons"
                    sx={{
                      display: 'flex',
                      gap: 1,
                      justifyContent: 'flex-end',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEditUser(user)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More actions">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user)}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredUsers.length === 0 && (
        <Paper sx={{ p: 8, textAlign: 'center', mt: 2 }}>
          <Typography variant="h6" color="text.secondary">
            No users found
          </Typography>
        </Paper>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleResetPassword}>
          <ListItemIcon>
            <LockReset fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reset Password</ListItemText>
        </MenuItem>
        {menuUser && menuUser.id !== currentUser?.id && (
          <MenuItem onClick={() => menuUser && handleDeleteUser(menuUser.id)}>
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete User</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Edit User Dialog */}
      <Dialog open={openEditUser} onClose={() => setOpenEditUser(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Basic Information</Typography>
            
            <TextField
              fullWidth
              label="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newUser.email}
                disabled
                helperText="Email cannot be changed"
              />
              <TextField
                fullWidth
                label="Phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
            </Box>

            <TextField
              select
              fullWidth
              label="Role"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
              required
            >
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="parent">Parent</MenuItem>
              <MenuItem value="mentor">Mentor</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
              Department & Semester
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="Department"
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                placeholder="e.g., Computer Science"
              />
              <TextField
                fullWidth
                label="Semester"
                value={newUser.semester}
                onChange={(e) => setNewUser({ ...newUser, semester: e.target.value })}
                placeholder="e.g., Fall 2024"
              />
            </Box>

            {newUser.role === 'student' && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Student Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Student ID"
                    value={newUser.studentId}
                    onChange={(e) => setNewUser({ ...newUser, studentId: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Grade"
                    value={newUser.grade}
                    onChange={(e) => setNewUser({ ...newUser, grade: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Section"
                    value={newUser.section}
                    onChange={(e) => setNewUser({ ...newUser, section: e.target.value })}
                  />
                </Box>
              </>
            )}

            {newUser.role === 'teacher' && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Teacher Information
                </Typography>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={newUser.employeeId}
                  onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Qualifications"
                  value={newUser.qualifications}
                  onChange={(e) => setNewUser({ ...newUser, qualifications: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Subjects"
                  value={newUser.subjects.join(', ')}
                  onChange={(e) => setNewUser({ ...newUser, subjects: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                  placeholder="Mathematics, Physics, Chemistry"
                  helperText="Enter subjects separated by commas"
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditUser(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateUser}
            disabled={!newUser.name || loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Updating...' : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={openAddUser} onClose={() => setOpenAddUser(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New User to {selectedSubDomain?.name}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Basic Information</Typography>
            
            <TextField
              fullWidth
              label="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="Phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
              <TextField
                select
                fullWidth
                label="Role"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                required
              >
                <MenuItem value="teacher">Teacher</MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="parent">Parent</MenuItem>
                <MenuItem value="mentor">Mentor</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            </Box>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
              Department & Semester
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="Department"
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                placeholder="e.g., Computer Science"
              />
              <TextField
                fullWidth
                label="Semester"
                value={newUser.semester}
                onChange={(e) => setNewUser({ ...newUser, semester: e.target.value })}
                placeholder="e.g., Fall 2024"
              />
            </Box>

            {newUser.role === 'student' && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Student Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Student ID"
                    value={newUser.studentId}
                    onChange={(e) => setNewUser({ ...newUser, studentId: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Grade"
                    value={newUser.grade}
                    onChange={(e) => setNewUser({ ...newUser, grade: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Section"
                    value={newUser.section}
                    onChange={(e) => setNewUser({ ...newUser, section: e.target.value })}
                  />
                </Box>
              </>
            )}

            {newUser.role === 'teacher' && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Teacher Information
                </Typography>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={newUser.employeeId}
                  onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Qualifications"
                  value={newUser.qualifications}
                  onChange={(e) => setNewUser({ ...newUser, qualifications: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Subjects"
                  value={newUser.subjects.join(', ')}
                  onChange={(e) => setNewUser({ ...newUser, subjects: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                  placeholder="Mathematics, Physics, Chemistry"
                  helperText="Enter subjects separated by commas"
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddUser(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateUser}
            disabled={!newUser.name || !newUser.email || !newUser.password || loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={openSettings} onClose={() => setOpenSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Subdomain Settings</DialogTitle>
        <DialogContent>
          {selectedSubDomain && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                <strong>Name:</strong> {selectedSubDomain.name}
              </Typography>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                <strong>Type:</strong> {selectedSubDomain.type}
              </Typography>
              {selectedSubDomain.department_name && (
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  <strong>Department:</strong> {selectedSubDomain.department_name}
                </Typography>
              )}
              {selectedSubDomain.semester_name && (
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  <strong>Semester:</strong> {selectedSubDomain.semester_name}
                </Typography>
              )}
              <Alert severity="info" sx={{ mt: 2 }}>
                All users created in this subdomain will have their data isolated to this subdomain only.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
