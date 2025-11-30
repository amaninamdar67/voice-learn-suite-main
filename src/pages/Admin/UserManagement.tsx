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
  Add,
  Edit,
  Delete,
  MoreVert,
  PersonAdd,
  LockReset,
  Search,
  FilterList,
} from '@mui/icons-material';
import { UserRole } from '../../types';
import { supabase } from '../../lib/supabase';

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
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      semester: 'Fall 2024',
      branch: 'Computer Science',
      status: 'active',
      lastLogin: '2 hours ago',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'teacher',
      branch: 'Mathematics',
      status: 'active',
      lastLogin: '1 day ago',
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'student',
      semester: 'Fall 2024',
      branch: 'Engineering',
      status: 'active',
      lastLogin: '3 hours ago',
    },
    {
      id: '4',
      name: 'Alice Williams',
      email: 'alice@example.com',
      role: 'mentor',
      status: 'active',
      lastLogin: '5 hours ago',
    },
    {
      id: '5',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      role: 'parent',
      status: 'inactive',
      lastLogin: '1 week ago',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [openAssignMentor, setOpenAssignMentor] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<User | null>(null);
  
  // Mentors list
  const [mentors, setMentors] = useState<User[]>([]);

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
    qualifications: '',
    expertiseArea: '',
    domain_id: '',
    sub_domain_id: '',
    department_id: '',
    semester_id: '',
    children_ids: [] as string[],
    subjects: [] as string[], // For teacher role
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Domain hierarchy data
  const [domains, setDomains] = useState<any[]>([]);
  const [subDomains, setSubDomains] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  
  // Filtered lists based on selections
  const [filteredSubDomains, setFilteredSubDomains] = useState<any[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<any[]>([]);
  const [filteredSemesters, setFilteredSemesters] = useState<any[]>([]);
  
  // Students list for parent assignment
  const [students, setStudents] = useState<User[]>([]);

  // Helper function to format relative time
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

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
      const data = await response.json();

      if (data.users) {
        const formattedUsers: User[] = data.users.map((profile: any) => {
          // Determine status based on last login
          const lastLoginDate = profile.last_sign_in_at ? new Date(profile.last_sign_in_at) : null;
          const daysSinceLogin = lastLoginDate 
            ? Math.floor((new Date().getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24))
            : 999;
          
          return {
            id: profile.id,
            name: profile.full_name || 'N/A',
            email: profile.email || 'N/A',
            role: profile.role,
            semester: profile.grade || '',
            branch: profile.department || '',
            status: daysSinceLogin > 30 ? 'inactive' : 'active',
            lastLogin: getRelativeTime(profile.last_sign_in_at || profile.created_at),
            domain_id: profile.domain_id,
            semester_id: profile.semester_id,
            subjects: profile.subjects || [],
          } as any;
        });
        setUsers(formattedUsers);
        
        // Filter students for parent assignment
        setStudents(formattedUsers.filter(u => u.role === 'student'));
        
        // Filter mentors for mentor assignment
        setMentors(formattedUsers.filter(u => u.role === 'mentor'));
      }
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    }
  };

  // Load users and domain data from backend
  useEffect(() => {
    loadUsers();
    loadDomainData();
  }, []);

  const loadDomainData = async () => {
    try {
      const [domainsRes, subDomainsRes, departmentsRes, semestersRes] = await Promise.all([
        fetch('http://localhost:3001/api/domains'),
        fetch('http://localhost:3001/api/subdomains'),
        fetch('http://localhost:3001/api/departments'),
        fetch('http://localhost:3001/api/semesters'),
      ]);

      const domainsData = await domainsRes.json();
      const subDomainsData = await subDomainsRes.json();
      const departmentsData = await departmentsRes.json();
      const semestersData = await semestersRes.json();

      setDomains(domainsData.domains || []);
      setSubDomains(subDomainsData.subdomains || []);
      setDepartments(departmentsData.departments || []);
      setSemesters(semestersData.semesters || []);
    } catch (err) {
      console.error('Error loading domain data:', err);
    }
  };

  // Update filtered lists when domain selection changes
  useEffect(() => {
    if (newUser.domain_id) {
      setFilteredSubDomains(subDomains.filter(sd => sd.domain_id === newUser.domain_id));
      setFilteredDepartments(departments.filter(d => d.domain_id === newUser.domain_id));
      setFilteredSemesters(semesters.filter(s => s.domain_id === newUser.domain_id));
    } else {
      setFilteredSubDomains([]);
      setFilteredDepartments([]);
      setFilteredSemesters([]);
    }
  }, [newUser.domain_id, subDomains, departments, semesters]);

  // Further filter semesters by department if selected
  useEffect(() => {
    if (newUser.department_id && newUser.domain_id) {
      setFilteredSemesters(
        semesters.filter(s => 
          s.domain_id === newUser.domain_id && 
          (!s.department_id || s.department_id === newUser.department_id)
        )
      );
    }
  }, [newUser.department_id, newUser.domain_id, semesters]);

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
    
    // Fetch full user details from backend
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
          qualifications: profile.qualifications || '',
          expertiseArea: profile.expertise_area || '',
          domain_id: profile.domain_id || '',
          sub_domain_id: profile.sub_domain_id || '',
          department_id: profile.department_id || '',
          semester_id: profile.semester_id || '',
          children_ids: [],
          subjects: profile.subjects || [],
        });
      }
    } catch (err) {
      console.error('Error loading user details:', err);
    }
    
    setOpenEditUser(true);
    handleMenuClose();
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
    handleMenuClose();
  };

  const handleClearForm = () => {
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
      qualifications: '',
      expertiseArea: '',
      domain_id: '',
      sub_domain_id: '',
      department_id: '',
      semester_id: '',
      children_ids: [],
      subjects: [],
    });
    setError('');
    setSuccess('');
  };

  const handleAssignMentor = () => {
    if (menuUser) {
      setSelectedUser(menuUser);
      setOpenAssignMentor(true);
    }
    handleMenuClose();
  };

  const handleSaveMentorAssignment = async () => {
    if (!selectedUser || !selectedMentorId) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentor_id: selectedMentorId }),
      });

      if (!response.ok) throw new Error('Failed to assign mentor');

      setSuccess('Mentor assigned successfully!');
      setOpenAssignMentor(false);
      setSelectedMentorId('');
      await loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    alert('Password reset email sent!');
    handleMenuClose();
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare profile data
      const profileData: any = {
        role: newUser.role,
        full_name: newUser.name,
        phone: newUser.phone || null,
        domain_id: newUser.domain_id || null,
        sub_domain_id: newUser.sub_domain_id || null,
        department_id: newUser.department_id || null,
        semester_id: newUser.semester_id || null,
      };

      // Add role-specific fields
      if (newUser.role === 'student') {
        profileData.student_id = newUser.studentId;
        profileData.grade = newUser.grade;
        profileData.section = newUser.section;
      } else if (newUser.role === 'teacher') {
        profileData.employee_id = newUser.employeeId;
        profileData.department = newUser.department;
        profileData.qualifications = newUser.qualifications;
        profileData.subjects = newUser.subjects; // Add subjects for teachers
      } else if (newUser.role === 'mentor') {
        profileData.mentor_id = newUser.mentorId;
        profileData.expertise_area = newUser.expertiseArea;
      } else if (newUser.role === 'admin') {
        profileData.employee_id = newUser.employeeId;
      }

      // Call backend API
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
      
      // Reload users
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare profile data
      const profileData: any = {
        role: newUser.role,
        full_name: newUser.name,
        phone: newUser.phone || null,
        domain_id: newUser.domain_id || null,
        sub_domain_id: newUser.sub_domain_id || null,
        department_id: newUser.department_id || null,
        semester_id: newUser.semester_id || null,
      };

      // Add role-specific fields
      if (newUser.role === 'student') {
        profileData.student_id = newUser.studentId;
        profileData.grade = newUser.grade;
        profileData.section = newUser.section;
      } else if (newUser.role === 'teacher') {
        profileData.employee_id = newUser.employeeId;
        profileData.department = newUser.department;
        profileData.qualifications = newUser.qualifications;
        profileData.subjects = newUser.subjects; // Add subjects for teachers
      } else if (newUser.role === 'mentor') {
        profileData.mentor_id = newUser.mentorId;
        profileData.expertise_area = newUser.expertiseArea;
      } else if (newUser.role === 'admin') {
        profileData.employee_id = newUser.employeeId;
      }

      // Call backend API
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

      // If parent role, create parent-children relationships
      if (newUser.role === 'parent' && newUser.children_ids.length > 0) {
        const relationships = newUser.children_ids.map(child_id => ({
          parent_id: data.user.id,
          child_id: child_id
        }));

        await fetch('http://localhost:3001/api/parent-children', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ relationships }),
        });
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
        qualifications: '',
        expertiseArea: '',
        domain_id: '',
        sub_domain_id: '',
        department_id: '',
        semester_id: '',
        children_ids: [],
        subjects: [],
      });
      
      // Reload users
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSemester = semesterFilter === 'all' || (user as any).semester_id === semesterFilter;
    const matchesDomain = domainFilter === 'all' || (user as any).domain_id === domainFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.status === 'active') ||
                         (statusFilter === 'inactive' && user.status === 'inactive');
    return matchesSearch && matchesRole && matchesSemester && matchesDomain && matchesStatus;
  });

  // Sort by last login if "Last Login" filter is selected
  const sortedUsers = statusFilter === 'recent' 
    ? [...filteredUsers].sort((a, b) => {
        // Sort by most recent login (assuming lastLogin is a relative time string)
        return a.lastLogin.localeCompare(b.lastLogin);
      })
    : filteredUsers;

  const getRoleColor = (role: UserRole) => {
    const colors = {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all users in the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            // Just open dialog - don't clear form
            setOpenAddUser(true);
          }}
        >
          Add User
        </Button>
      </Box>

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
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="parent">Parent</MenuItem>
            <MenuItem value="mentor">Mentor</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Domain"
            value={domainFilter}
            onChange={(e) => {
              setDomainFilter(e.target.value);
              setSemesterFilter('all'); // Reset semester when domain changes
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">All Domains</MenuItem>
            {domains.map((domain) => (
              <MenuItem key={domain.id} value={domain.id}>
                {domain.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Semester"
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            sx={{ minWidth: 150 }}
            disabled={domainFilter === 'all'}
          >
            <MenuItem value="all">All Semesters</MenuItem>
            {semesters
              .filter(sem => domainFilter === 'all' || sem.domain_id === domainFilter)
              .map((semester) => (
                <MenuItem key={semester.id} value={semester.id}>
                  {semester.name}
                </MenuItem>
              ))}
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
            <MenuItem value="recent">Last Login</MenuItem>
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
              <TableCell>Branch/Semester</TableCell>
              <TableCell>Subjects</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedUsers.map((user) => (
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
                  {user.branch && (
                    <Typography variant="body2">{user.branch}</Typography>
                  )}
                  {user.semester && (
                    <Typography variant="caption" color="text.secondary">
                      {user.semester}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {user.role === 'teacher' ? (
                    (user as any).subjects && (user as any).subjects.length > 0 ? (
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
                        No subjects assigned
                      </Typography>
                    )
                  ) : (
                    <Typography variant="caption" color="text.secondary" fontStyle="italic">
                      Not a teacher
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
        {menuUser?.role === 'student' && (
          <MenuItem onClick={handleAssignMentor}>
            <ListItemIcon>
              <PersonAdd fontSize="small" />
            </ListItemIcon>
            <ListItemText>Assign Mentor</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleResetPassword}>
          <ListItemIcon>
            <LockReset fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reset Password</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => menuUser && handleDeleteUser(menuUser.id)}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add User Dialog */}
      <Dialog 
        open={openAddUser} 
        onClose={() => {
          // Don't reset form when closing - only reset after successful creation
          setOpenAddUser(false);
        }} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Add New User</DialogTitle>
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
                helperText="Min 6 characters"
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                select
                fullWidth
                label="Role"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                required
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="parent">Parent</MenuItem>
                <MenuItem value="mentor">Mentor</MenuItem>
              </TextField>
              
              <TextField
                fullWidth
                label="Phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
            </Box>

            {/* Domain Hierarchy Selection */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
              Domain Assignment
            </Typography>
            
            <TextField
              select
              fullWidth
              label="Domain / Organization"
              value={newUser.domain_id}
              onChange={(e) => setNewUser({ 
                ...newUser, 
                domain_id: e.target.value,
                sub_domain_id: '',
                department_id: '',
                semester_id: ''
              })}
              required
              helperText={newUser.role === 'admin' ? 'Admin manages this entire domain' : 'Select the organization/school/college'}
            >
              <MenuItem value="">Select Domain</MenuItem>
              {domains.map((domain) => (
                <MenuItem key={domain.id} value={domain.id}>
                  {domain.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Only show sub-domain, department, and semester for non-admin roles */}
            {newUser.domain_id && newUser.role !== 'admin' && (
              <>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    select
                    fullWidth
                    label="Sub-Domain"
                    value={newUser.sub_domain_id}
                    onChange={(e) => setNewUser({ ...newUser, sub_domain_id: e.target.value })}
                    helperText="Primary/High School/UG/PG"
                  >
                    <MenuItem value="">None</MenuItem>
                    {filteredSubDomains.map((subDomain) => (
                      <MenuItem key={subDomain.id} value={subDomain.id}>
                        {subDomain.name} ({subDomain.type})
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label="Department"
                    value={newUser.department_id}
                    onChange={(e) => setNewUser({ 
                      ...newUser, 
                      department_id: e.target.value,
                      semester_id: ''
                    })}
                    helperText="Grade/Department"
                  >
                    <MenuItem value="">None</MenuItem>
                    {filteredDepartments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <TextField
                  select
                  fullWidth
                  label="Semester"
                  value={newUser.semester_id}
                  onChange={(e) => setNewUser({ ...newUser, semester_id: e.target.value })}
                  helperText="Academic term/semester"
                >
                  <MenuItem value="">None</MenuItem>
                  {filteredSemesters.map((semester) => (
                    <MenuItem key={semester.id} value={semester.id}>
                      {semester.name}
                      {semester.department_id && ` (${departments.find(d => d.id === semester.department_id)?.name})`}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}

            {/* Student Fields */}
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
                    placeholder="STU001"
                  />
                  <TextField
                    fullWidth
                    label="Grade"
                    value={newUser.grade}
                    onChange={(e) => setNewUser({ ...newUser, grade: e.target.value })}
                    placeholder="Grade 10"
                  />
                  <TextField
                    fullWidth
                    label="Section"
                    value={newUser.section}
                    onChange={(e) => setNewUser({ ...newUser, section: e.target.value })}
                    placeholder="A"
                  />
                </Box>
              </>
            )}

            {/* Teacher Fields */}
            {newUser.role === 'teacher' && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Teacher Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={newUser.employeeId}
                    onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                    placeholder="EMP001"
                  />
                  <TextField
                    fullWidth
                    label="Department"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    placeholder="Mathematics"
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Qualifications"
                  value={newUser.qualifications}
                  onChange={(e) => setNewUser({ ...newUser, qualifications: e.target.value })}
                  placeholder="M.Sc. Mathematics"
                />
                <TextField
                  select
                  fullWidth
                  label="Subjects"
                  value={newUser.subjects}
                  onChange={(e) => setNewUser({ ...newUser, subjects: e.target.value as any })}
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    ),
                  }}
                  helperText="Select one or more subjects this teacher will handle"
                >
                  <MenuItem value="Mathematics">Mathematics</MenuItem>
                  <MenuItem value="Physics">Physics</MenuItem>
                  <MenuItem value="Chemistry">Chemistry</MenuItem>
                  <MenuItem value="Biology">Biology</MenuItem>
                  <MenuItem value="Computer Science">Computer Science</MenuItem>
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="History">History</MenuItem>
                  <MenuItem value="Geography">Geography</MenuItem>
                  <MenuItem value="Economics">Economics</MenuItem>
                  <MenuItem value="Business Studies">Business Studies</MenuItem>
                  <MenuItem value="Accountancy">Accountancy</MenuItem>
                  <MenuItem value="Physical Education">Physical Education</MenuItem>
                </TextField>
              </>
            )}

            {/* Mentor Fields */}
            {newUser.role === 'mentor' && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Mentor Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Mentor ID"
                    value={newUser.mentorId}
                    onChange={(e) => setNewUser({ ...newUser, mentorId: e.target.value })}
                    placeholder="MEN001"
                  />
                  <TextField
                    fullWidth
                    label="Expertise Area"
                    value={newUser.expertiseArea}
                    onChange={(e) => setNewUser({ ...newUser, expertiseArea: e.target.value })}
                    placeholder="Career Guidance"
                  />
                </Box>
              </>
            )}

            {/* Admin Fields */}
            {newUser.role === 'admin' && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Admin Information
                </Typography>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={newUser.employeeId}
                  onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                  placeholder="EMP001"
                />
              </>
            )}

            {/* Parent Fields */}
            {newUser.role === 'parent' && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Parent Information
                </Typography>
                <TextField
                  select
                  fullWidth
                  label="Select Children"
                  value={newUser.children_ids}
                  onChange={(e) => setNewUser({ ...newUser, children_ids: e.target.value as any })}
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected) => {
                      const selectedIds = selected as string[];
                      if (selectedIds.length === 0) return 'Select children...';
                      return selectedIds
                        .map(id => students.find(s => s.id === id)?.name)
                        .filter(Boolean)
                        .join(', ');
                    },
                  }}
                  helperText="Select one or more student accounts to link as children"
                >
                  {students.length === 0 ? (
                    <MenuItem disabled>No students available</MenuItem>
                  ) : (
                    students.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.name} {student.semester && `- ${student.semester}`} {student.branch && `(${student.branch})`}
                      </MenuItem>
                    ))
                  )}
                </TextField>
                {students.length === 0 && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    No student accounts found. Please create student accounts first before adding parents.
                  </Alert>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button 
            onClick={handleClearForm} 
            disabled={loading}
            color="warning"
            variant="outlined"
          >
            Clear Form
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setOpenAddUser(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddUser}
              disabled={!newUser.name || !newUser.email || !newUser.password || loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

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
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="parent">Parent</MenuItem>
              <MenuItem value="mentor">Mentor</MenuItem>
            </TextField>

            {/* Domain Hierarchy Selection */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
              Domain Assignment
            </Typography>
            
            <TextField
              select
              fullWidth
              label="Domain / Organization"
              value={newUser.domain_id}
              onChange={(e) => setNewUser({ 
                ...newUser, 
                domain_id: e.target.value,
                sub_domain_id: '',
                department_id: '',
                semester_id: ''
              })}
              required
              helperText={newUser.role === 'admin' ? 'Admin manages this entire domain' : ''}
            >
              <MenuItem value="">Select Domain</MenuItem>
              {domains.map((domain) => (
                <MenuItem key={domain.id} value={domain.id}>
                  {domain.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Only show sub-domain, department, and semester for non-admin roles */}
            {newUser.domain_id && newUser.role !== 'admin' && (
              <>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    select
                    fullWidth
                    label="Sub-Domain"
                    value={newUser.sub_domain_id}
                    onChange={(e) => setNewUser({ ...newUser, sub_domain_id: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {filteredSubDomains.map((subDomain) => (
                      <MenuItem key={subDomain.id} value={subDomain.id}>
                        {subDomain.name} ({subDomain.type})
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label="Department"
                    value={newUser.department_id}
                    onChange={(e) => setNewUser({ 
                      ...newUser, 
                      department_id: e.target.value,
                      semester_id: ''
                    })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {filteredDepartments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <TextField
                  select
                  fullWidth
                  label="Semester"
                  value={newUser.semester_id}
                  onChange={(e) => setNewUser({ ...newUser, semester_id: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  {filteredSemesters.map((semester) => (
                    <MenuItem key={semester.id} value={semester.id}>
                      {semester.name}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}

            {/* Role-specific fields */}
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
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={newUser.employeeId}
                    onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Department"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Qualifications"
                  value={newUser.qualifications}
                  onChange={(e) => setNewUser({ ...newUser, qualifications: e.target.value })}
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

      {/* Assign Mentor Dialog */}
      <Dialog open={openAssignMentor} onClose={() => setOpenAssignMentor(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Mentor to {selectedUser?.name}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Select Mentor"
              value={selectedMentorId}
              onChange={(e) => setSelectedMentorId(e.target.value)}
              helperText="Choose a mentor to guide this student"
            >
              <MenuItem value="">None</MenuItem>
              {mentors.map((mentor) => (
                <MenuItem key={mentor.id} value={mentor.id}>
                  {mentor.name} {mentor.branch && `- ${mentor.branch}`}
                </MenuItem>
              ))}
            </TextField>
            
            {mentors.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No mentors available. Please create mentor accounts first.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignMentor(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveMentorAssignment}
            disabled={!selectedMentorId || loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Assigning...' : 'Assign Mentor'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
