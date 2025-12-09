import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, List, ListItem, ListItemButton,
  ListItemText, InputAdornment, Divider, Card, CardContent, Switch, FormControlLabel, MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, Search, Settings as SettingsIcon, PersonAdd, Visibility, VisibilityOff } from '@mui/icons-material';

interface Domain {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface SubDomain {
  id: string;
  domain_id: string;
  name: string;
  type: string;
  department_name: string;
  semester_name: string;
  description: string;
  is_active: boolean;
}

const DomainManagement: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [subDomains, setSubDomains] = useState<SubDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [domainSearch, setDomainSearch] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openManageDialog, setOpenManageDialog] = useState(false);
  const [openDomainDialog, setOpenDomainDialog] = useState(false);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [managingSubDomain, setManagingSubDomain] = useState<SubDomain | null>(null);
  const [selectedSubDomainForUsers, setSelectedSubDomainForUsers] = useState<SubDomain | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'ug',
    description: '',
    isActive: true,
  });

  const [domainForm, setDomainForm] = useState({ name: '', description: '', isActive: true });

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    employeeId: '',
    mentorId: '',
    section: '',
    department: '',
    semester: '',
    qualifications: '',
    expertiseArea: '',
    subjects: [] as string[],
  });

  const typeOptions = [
    { value: 'primary', label: 'Primary School' },
    { value: 'high', label: 'High School' },
    { value: 'college', label: 'College' },
    { value: 'ug', label: 'Undergraduate' },
    { value: 'pg', label: 'Postgraduate' },
    { value: 'phd', label: 'PhD' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [domainsRes, subDomainsRes] = await Promise.all([
        fetch('http://localhost:3001/api/domains'),
        fetch('http://localhost:3001/api/subdomains'),
      ]);

      const domainsData = await domainsRes.json();
      const subDomainsData = await subDomainsRes.json();

      const loadedDomains = domainsData.domains || [];
      setDomains(loadedDomains);
      setSubDomains(subDomainsData.subdomains || []);

      if (!selectedDomain && loadedDomains.length > 0) {
        setSelectedDomain(loadedDomains[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubDomain = async () => {
    if (!selectedDomain) return;
    
    try {
      setError('');
      setLoading(true);

      const res = await fetch('http://localhost:3001/api/subdomains/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          description: formData.description,
          domain_id: selectedDomain.id,
        }),
      });

      if (!res.ok) throw new Error('Failed to create sub-domain');

      setSuccess('Sub-Domain created successfully!');
      setOpenAddDialog(false);
      setFormData({ name: '', type: 'ug', description: '', isActive: true });
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubDomain = async () => {
    if (!managingSubDomain) return;
    
    try {
      setLoading(true);
      await fetch(`http://localhost:3001/api/subdomains/${managingSubDomain.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          description: formData.description,
          is_active: formData.isActive,
        }),
      });

      setSuccess('Sub-domain updated successfully!');
      setOpenManageDialog(false);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubDomain = async (id: string) => {
    if (!window.confirm('Delete this sub-domain?')) return;

    try {
      await fetch(`http://localhost:3001/api/subdomains/${id}`, { method: 'DELETE' });
      setSuccess('Deleted successfully!');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddUser = async () => {
    if (!selectedSubDomainForUsers) return;

    try {
      setLoading(true);
      const profileData: any = {
        role: userForm.role,
        full_name: userForm.name,
        phone: userForm.phone || null,
        sub_domain_id: selectedSubDomainForUsers.id,
        department: userForm.department || null,
        semester: userForm.semester || null,
      };

      if (userForm.role === 'student') {
        profileData.section = userForm.section;
      } else if (userForm.role === 'teacher') {
        profileData.employee_id = userForm.employeeId;
        profileData.qualifications = userForm.qualifications;
        profileData.subjects = userForm.subjects;
      } else if (userForm.role === 'mentor') {
        profileData.mentor_id = userForm.mentorId;
        profileData.expertise_area = userForm.expertiseArea;
      } else if (userForm.role === 'admin') {
        profileData.employee_id = userForm.employeeId;
      }

      const response = await fetch('http://localhost:3001/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userForm.email,
          password: userForm.password,
          profile: profileData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess(`User ${userForm.name} created successfully!`);
      // Clear form after successful creation
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'student',
        phone: '',
        employeeId: '',
        mentorId: '',
        section: '',
        department: '',
        semester: '',
        qualifications: '',
        expertiseArea: '',
        subjects: [],
      });
      // Close dialog after a short delay to show success message
      setTimeout(() => {
        setOpenAddUserDialog(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const filteredDomains = domains.filter(d =>
    d.name.toLowerCase().includes(domainSearch.toLowerCase())
  );

  const filteredSubDomains = subDomains.filter(sd => sd.domain_id === selectedDomain?.id);

  if (loading && domains.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 180px)', gap: 0, ml: -3, mr: -3 }}>
      {/* Sidebar */}
      <Paper elevation={0} sx={{ width: 280, flexShrink: 0, borderRadius: 0, borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Domains</Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search domains..."
            value={domainSearch}
            onChange={(e) => setDomainSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          />
        </Box>

        <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
          {filteredDomains.map((domain) => (
            <ListItem key={domain.id} disablePadding>
              <ListItemButton
                selected={selectedDomain?.id === domain.id}
                onClick={() => setSelectedDomain(domain)}
                sx={{ borderLeft: 3, borderColor: selectedDomain?.id === domain.id ? 'primary.main' : 'transparent' }}
              >
                <ListItemText
                  primary={domain.name}
                  secondary={domain.is_active ? 'Active' : 'In-Active'}
                  primaryTypographyProps={{ fontWeight: selectedDomain?.id === domain.id ? 600 : 400 }}
                  secondaryTypographyProps={{ color: domain.is_active ? 'success.main' : 'text.secondary' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Button fullWidth variant="contained" size="small" startIcon={<Add />} onClick={() => setOpenDomainDialog(true)}>
            Add Domain
          </Button>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" fontWeight={600}>{selectedDomain?.name || 'Select a Domain'}</Typography>
            <Typography variant="body2" color="text.secondary">{selectedDomain?.description || 'Choose a domain'}</Typography>
          </Box>
          {selectedDomain && (
            <Button variant="outlined" size="small" startIcon={<Edit />} onClick={() => { setEditingDomain(selectedDomain); setDomainForm({ name: selectedDomain.name, description: selectedDomain.description, isActive: selectedDomain.is_active }); setOpenDomainDialog(true); }}>
              Manage Domain
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ m: 2, mb: 0 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ m: 2, mb: 0 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {selectedDomain && (
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Sub-Domains</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => { setFormData({ name: '', type: 'ug', description: '', isActive: true }); setOpenAddDialog(true); }}>
                Add Sub-Domain
              </Button>
            </Box>

            {filteredSubDomains.length === 0 ? (
              <Paper sx={{ p: 8, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">No sub-domains found</Typography>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredSubDomains.map((sd) => (
                  <Card key={sd.id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight={600}>{sd.name}</Typography>
                        <IconButton size="small" onClick={() => { setManagingSubDomain(sd); setFormData({ name: sd.name, type: sd.type, description: sd.description, isActive: sd.is_active }); setOpenManageDialog(true); }}>
                          <SettingsIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1, mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Type:</Typography>
                        <Typography variant="body2">{typeOptions.find(t => t.value === sd.type)?.label || sd.type}</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Status:</Typography>
                        <Typography variant="body2" color={sd.is_active ? 'success.main' : 'text.secondary'}>● {sd.is_active ? 'Active' : 'In-Active'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                          size="small" 
                          variant="contained" 
                          startIcon={<PersonAdd />}
                          onClick={() => {
                            setSelectedSubDomainForUsers(sd);
                            setUserForm({
                              name: '',
                              email: '',
                              password: '',
                              role: 'student',
                              phone: '',
                              employeeId: '',
                              mentorId: '',
                              section: '',
                              department: '',
                              semester: '',
                              qualifications: '',
                              expertiseArea: '',
                              subjects: [],
                            });
                            setOpenAddUserDialog(true);
                          }}
                        >
                          Add Users
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Add Sub-Domain Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Sub-Domain</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField fullWidth label="Sub-Domain Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g., B.E, B.Tech" />
            <TextField select fullWidth label="Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </TextField>
            <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSubDomain} disabled={!formData.name}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Sub-Domain Dialog */}
      <Dialog open={openManageDialog} onClose={() => setOpenManageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Sub-Domain</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField fullWidth label="Sub-Domain Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <TextField select fullWidth label="Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </TextField>
            <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} />
            <FormControlLabel control={<Switch checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />} label="Active" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button color="error" variant="outlined" startIcon={<Delete />} onClick={() => { if (managingSubDomain) { setOpenManageDialog(false); handleDeleteSubDomain(managingSubDomain.id); } }}>Delete</Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setOpenManageDialog(false)}>Close</Button>
            <Button variant="contained" onClick={handleUpdateSubDomain}>Save Changes</Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Domain Dialog */}
      <Dialog open={openDomainDialog} onClose={() => setOpenDomainDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingDomain ? 'Edit Domain' : 'Create Domain'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField fullWidth label="Domain Name" value={domainForm.name} onChange={(e) => setDomainForm({ ...domainForm, name: e.target.value })} required />
            <TextField fullWidth label="Description" value={domainForm.description} onChange={(e) => setDomainForm({ ...domainForm, description: e.target.value })} multiline rows={3} />
            <FormControlLabel control={<Switch checked={domainForm.isActive} onChange={(e) => setDomainForm({ ...domainForm, isActive: e.target.checked })} />} label="Active" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          {editingDomain && (
            <Button color="error" variant="outlined" startIcon={<Delete />} onClick={async () => {
              if (!window.confirm('Delete this domain and all sub-domains?')) return;
              try {
                await fetch(`http://localhost:3001/api/domains/${editingDomain.id}`, { method: 'DELETE' });
                setSuccess('Domain deleted successfully!');
                setOpenDomainDialog(false);
                setEditingDomain(null);
                setSelectedDomain(null);
                await loadData();
              } catch (err: any) {
                setError(err.message);
              }
            }}>Delete Domain</Button>
          )}
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Button onClick={() => setOpenDomainDialog(false)}>Cancel</Button>
            <Button variant="contained" disabled={!domainForm.name} onClick={async () => {
              try {
                const endpoint = editingDomain 
                  ? `http://localhost:3001/api/domains/${editingDomain.id}`
                  : 'http://localhost:3001/api/domains/create';
                
                await fetch(endpoint, {
                  method: editingDomain ? 'PUT' : 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: domainForm.name,
                    description: domainForm.description,
                    is_active: domainForm.isActive,
                  }),
                });

                setSuccess(`Domain ${editingDomain ? 'updated' : 'created'} successfully!`);
                setOpenDomainDialog(false);
                setEditingDomain(null);
                await loadData();
              } catch (err: any) {
                setError(err.message);
              }
            }}>{ editingDomain ? 'Update' : 'Create'}</Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={openAddUserDialog} onClose={() => setOpenAddUserDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add User to {selectedSubDomainForUsers?.name}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Basic Information</Typography>
            
            <TextField
              fullWidth
              label="Full Name"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              required
            />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                required
                helperText="Min 6 characters"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ mr: -1 }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                select
                fullWidth
                label="Role"
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
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
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              />
            </Box>

            {(userForm.role === 'student' || userForm.role === 'teacher' || userForm.role === 'mentor') && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Department & Semester
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    placeholder="e.g., Computer Science"
                  />
                  <TextField
                    fullWidth
                    label="Semester"
                    value={userForm.semester}
                    onChange={(e) => setUserForm({ ...userForm, semester: e.target.value })}
                    placeholder="e.g., Fall 2024"
                  />
                </Box>
              </>
            )}

            {userForm.role === 'student' && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Student Information
                </Typography>
                <TextField
                  fullWidth
                  label="Section"
                  value={userForm.section}
                  onChange={(e) => setUserForm({ ...userForm, section: e.target.value })}
                  placeholder="e.g., A, B, C"
                />
              </>
            )}

            {userForm.role === 'teacher' && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Teacher Information
                </Typography>
                <TextField
                  fullWidth
                  label="Qualifications"
                  value={userForm.qualifications}
                  onChange={(e) => setUserForm({ ...userForm, qualifications: e.target.value })}
                  placeholder="M.Sc. Mathematics"
                />
                <TextField
                  fullWidth
                  label="Subjects"
                  value={userForm.subjects.join(', ')}
                  onChange={(e) => setUserForm({ ...userForm, subjects: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                  placeholder="Mathematics, Physics, Chemistry"
                  helperText="Enter subjects separated by commas"
                />
              </>
            )}

            {userForm.role === 'mentor' && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Mentor Information
                </Typography>
                <TextField
                  fullWidth
                  label="Expertise Area"
                  value={userForm.expertiseArea}
                  onChange={(e) => setUserForm({ ...userForm, expertiseArea: e.target.value })}
                  placeholder="Career Guidance"
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button 
            onClick={() => setUserForm({
              name: '',
              email: '',
              password: '',
              role: 'student',
              phone: '',
              employeeId: '',
              mentorId: '',
              section: '',
              department: '',
              semester: '',
              qualifications: '',
              expertiseArea: '',
              subjects: [],
            })}
            disabled={loading}
          >
            Clear
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setOpenAddUserDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddUser}
              disabled={!userForm.name || !userForm.email || !userForm.password || loading}
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DomainManagement;
