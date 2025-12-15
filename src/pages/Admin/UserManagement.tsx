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
  Delete,
  MoreVert,
  LockReset,
  Search,
  Edit,
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
  sub_domain_id?: string;
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
  const [domains, setDomains] = useState<any[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [subDomainFilter, setSubDomainFilter] = useState<string>('all');
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<User | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    role: 'student' as UserRole,
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

  // Load domains and subdomains
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load domains
        const domainsRes = await fetch('http://localhost:3001/api/domains');
        const domainsData = await domainsRes.json();
        setDomains(domainsData.domains || []);

        // Load subdomains
        const subDomainsRes = await fetch('http://localhost:3001/api/subdomains');
        const subDomainsData = await subDomainsRes.json();
        setSubDomains(subDomainsData.subdomains || []);
        
        // Auto-select first subdomain
        if (subDomainsData.subdomains && subDomainsData.subdomains.length > 0) {
          setSelectedSubDomain(subDomainsData.subdomains[0]);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    loadData();
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
              sub_domain_id: profile.sub_domain_id,
            } as any;
          });
          setUsers(formattedUsers);
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
            sub_domain_id: profile.sub_domain_id,
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

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      phone: '',
      role: user.role,
      qualifications: '',
      expertiseArea: '',
      subjects: (user as any).subjects || [],
    });
    setOpenEditDialog(true);
    handleMenuClose();
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const profileData: any = {
        full_name: editFormData.name,
        phone: editFormData.phone || null,
        role: editFormData.role,
      };

      if (editFormData.role === 'teacher') {
        profileData.qualifications = editFormData.qualifications;
        profileData.subjects = editFormData.subjects;
      } else if (editFormData.role === 'mentor') {
        profileData.expertise_area = editFormData.expertiseArea;
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

      setSuccess(`User ${editFormData.name} updated successfully!`);
      setOpenEditDialog(false);
      setSelectedUser(null);

      // Reload users
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
            sub_domain_id: profile.sub_domain_id,
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
    
    // Get user's subdomain to check domain and subdomain filters
    const userSubDomain = subDomains.find(sd => sd.id === (user as any).sub_domain_id);
    const matchesDomain = domainFilter === 'all' || (userSubDomain && userSubDomain.domain_id === domainFilter);
    const matchesSubDomain = subDomainFilter === 'all' || (user as any).sub_domain_id === subDomainFilter;
    
    return matchesSearch && matchesRole && matchesStatus && matchesDomain && matchesSubDomain;
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
        </Box>
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
            label="Domain"
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            sx={{ minWidth: 150 }}
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
            label="Sub-Domain"
            value={subDomainFilter}
            onChange={(e) => setSubDomainFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Sub-Domains</MenuItem>
            {subDomains
              .filter((sd) => domainFilter === 'all' || sd.domain_id === domainFilter)
              .map((sd) => (
                <MenuItem key={sd.id} value={sd.id}>
                  {sd.name}
                </MenuItem>
              ))}
          </TextField>
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
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditUser(user)}
                      >
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

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Basic Information</Typography>
            
            <TextField
              fullWidth
              label="Full Name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              required
            />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                select
                fullWidth
                label="Role"
                value={editFormData.role}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as UserRole })}
                required
              >
                <MenuItem value="teacher">Teacher</MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="parent">Parent</MenuItem>
                <MenuItem value="mentor">Mentor</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
              
              <TextField
                fullWidth
                label="Phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </Box>



            {editFormData.role === 'student' && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Student Information
                </Typography>
                <TextField
                  fullWidth
                  label="Section"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="e.g., A, B, C"
                />
              </>
            )}

            {editFormData.role === 'teacher' && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Teacher Information
                </Typography>
                <TextField
                  fullWidth
                  label="Qualifications"
                  value={editFormData.qualifications}
                  onChange={(e) => setEditFormData({ ...editFormData, qualifications: e.target.value })}
                  placeholder="M.Sc. Mathematics"
                />
                <TextField
                  fullWidth
                  label="Subjects"
                  value={editFormData.subjects.join(', ')}
                  onChange={(e) => setEditFormData({ ...editFormData, subjects: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                  placeholder="Mathematics, Physics, Chemistry"
                  helperText="Enter subjects separated by commas"
                />
              </>
            )}

            {editFormData.role === 'mentor' && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Mentor Information
                </Typography>
                <TextField
                  fullWidth
                  label="Expertise Area"
                  value={editFormData.expertiseArea}
                  onChange={(e) => setEditFormData({ ...editFormData, expertiseArea: e.target.value })}
                  placeholder="Career Guidance"
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 2 }}>
          <Button onClick={() => setOpenEditDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateUser}
            disabled={!editFormData.name || loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Updating...' : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>

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




    </Box>
  );
};

export default UserManagement;
