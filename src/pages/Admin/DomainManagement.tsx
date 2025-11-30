import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Business,
  Category,
  School,
  Search,
  CalendarMonth,
} from '@mui/icons-material';

interface Domain {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface Department {
  id: string;
  domain_id: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface SubDomain {
  id: string;
  domain_id: string;
  name: string;
  description: string;
  type: string;
  is_active: boolean;
}

interface Semester {
  id: string;
  domain_id: string;
  department_id?: string;
  name: string;
  description: string;
  is_active: boolean;
}

const DomainManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subDomains, setSubDomains] = useState<SubDomain[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected domain and search
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [domainSearch, setDomainSearch] = useState('');

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'domain' | 'department' | 'subdomain' | 'semester'>('domain');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    domain_id: '',
    department_id: '',
    type: 'grade',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [domainsRes, deptRes, subDomRes, semRes] = await Promise.all([
        fetch('http://localhost:3001/api/domains'),
        fetch('http://localhost:3001/api/departments'),
        fetch('http://localhost:3001/api/subdomains'),
        fetch('http://localhost:3001/api/semesters'),
      ]);

      const domainsData = await domainsRes.json();
      const deptData = await deptRes.json();
      const subDomData = await subDomRes.json();
      const semData = await semRes.json();

      const loadedDomains = domainsData.domains || [];
      setDomains(loadedDomains);
      setDepartments(deptData.departments || []);
      setSubDomains(subDomData.subdomains || []);
      setSemesters(semData.semesters || []);

      // Auto-select first domain if none selected
      if (!selectedDomain && loadedDomains.length > 0) {
        setSelectedDomain(loadedDomains[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter domains by search
  const filteredDomains = domains.filter(domain =>
    domain.name.toLowerCase().includes(domainSearch.toLowerCase())
  );

  // Filter data by selected domain
  const filteredSubDomains = subDomains.filter(sd => sd.domain_id === selectedDomain?.id);
  const filteredDepartments = departments.filter(d => d.domain_id === selectedDomain?.id);
  const filteredSemesters = semesters.filter(s => s.domain_id === selectedDomain?.id);

  const handleOpenDialog = (type: 'domain' | 'department' | 'subdomain' | 'semester', item?: any) => {
    setDialogType(type);
    setEditingItem(item || null);
    setFormData({
      name: item?.name || '',
      description: item?.description || '',
      domain_id: item?.domain_id || selectedDomain?.id || '',
      department_id: item?.department_id || '',
      type: item?.type || 'grade',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({ name: '', description: '', domain_id: '', department_id: '', type: 'grade' });
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setError('');
      const endpoint = editingItem
        ? `http://localhost:3001/api/${dialogType}s/${editingItem.id}`
        : `http://localhost:3001/api/${dialogType}s/create`;

      const response = await fetch(endpoint, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Operation failed');
      }

      setSuccess(`${dialogType} ${editingItem ? 'updated' : 'created'} successfully!`);
      handleCloseDialog();
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    // Special warning for domain deletion
    if (type === 'domain') {
      const confirmMessage = 
        'WARNING: Deleting this domain will also delete:\n' +
        '- All sub-domains\n' +
        '- All departments\n' +
        '- All semesters\n' +
        '- All lessons associated with this domain\n\n' +
        'Users in this domain will NOT be deleted, but their domain association will be removed.\n\n' +
        'Are you absolutely sure you want to delete this domain?';
      
      if (!window.confirm(confirmMessage)) return;
    } else {
      if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/${type}s/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Delete failed');
      }

      setSuccess(`${type} deleted successfully!`);
      
      // If deleting the currently selected domain, clear selection
      if (type === 'domain' && selectedDomain?.id === id) {
        setSelectedDomain(null);
      }
      
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 180px)', gap: 0, ml: -3, mr: -3, position: 'relative' }}>
      {/* Sub-Sidebar for Domains */}
      <Paper
        elevation={0}
        sx={{
          width: 280,
          flexShrink: 0,
          borderRadius: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 1 }}>
            Domains
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search domains..."
            value={domainSearch}
            onChange={(e) => setDomainSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
          {filteredDomains.map((domain) => (
            <ListItem key={domain.id} disablePadding>
              <ListItemButton
                selected={selectedDomain?.id === domain.id}
                onClick={() => setSelectedDomain(domain)}
                sx={{
                  borderLeft: 3,
                  borderColor: selectedDomain?.id === domain.id ? 'primary.main' : 'transparent',
                }}
              >
                <ListItemText
                  primary={domain.name}
                  secondary={domain.is_active ? 'Active' : 'Inactive'}
                  primaryTypographyProps={{ fontWeight: selectedDomain?.id === domain.id ? 600 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => handleOpenDialog('domain')}
          >
            Add Domain
          </Button>
        </Box>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {selectedDomain?.name || 'Select a Domain'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedDomain?.description || 'Choose a domain from the sidebar to manage its structure'}
            </Typography>
          </Box>
          {selectedDomain && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Edit />}
              onClick={() => handleOpenDialog('domain', selectedDomain)}
            >
              Manage Domain
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2, mb: 0 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ m: 2, mb: 0 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {selectedDomain && (
          <>
            <Paper sx={{ mx: 2, mt: 2, mb: 0 }}>
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                <Tab icon={<School />} label="Sub-Domains" />
                <Tab icon={<Category />} label="Departments" />
                <Tab icon={<CalendarMonth />} label="Semesters" />
              </Tabs>
            </Paper>

            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, pt: 1.5 }}>

              {/* Sub-Domains Tab */}
              {tabValue === 0 && (
                <Paper>
                  <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Sub-Domains (Primary School / High School / College / UG / PG / PhD)
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => handleOpenDialog('subdomain')}
                    >
                      Add Sub-Domain
                    </Button>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredSubDomains.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Typography color="text.secondary">
                                No sub-domains found. Click "Add Sub-Domain" to create one.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSubDomains.map((sub) => (
                            <TableRow key={sub.id}>
                              <TableCell>{sub.name}</TableCell>
                              <TableCell>
                                <Chip label={sub.type} size="small" variant="outlined" />
                              </TableCell>
                              <TableCell>{sub.description}</TableCell>
                              <TableCell>
                                <Chip
                                  label={sub.is_active ? 'Active' : 'Inactive'}
                                  color={sub.is_active ? 'success' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <IconButton size="small" onClick={() => handleOpenDialog('subdomain', sub)}>
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleDelete('subdomain', sub.id)}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {/* Departments Tab */}
              {tabValue === 1 && (
                <Paper>
                  <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Departments (1st-10th Grade / CS / Commerce / Mechanical)
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => handleOpenDialog('department')}
                    >
                      Add Department
                    </Button>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredDepartments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                              <Typography color="text.secondary">
                                No departments found. Click "Add Department" to create one.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDepartments.map((dept) => (
                            <TableRow key={dept.id}>
                              <TableCell>{dept.name}</TableCell>
                              <TableCell>{dept.description}</TableCell>
                              <TableCell>
                                <Chip
                                  label={dept.is_active ? 'Active' : 'Inactive'}
                                  color={dept.is_active ? 'success' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <IconButton size="small" onClick={() => handleOpenDialog('department', dept)}>
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleDelete('department', dept.id)}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {/* Semesters Tab */}
              {tabValue === 2 && (
                <Paper>
                  <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={600}>Semesters</Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => handleOpenDialog('semester')}
                    >
                      Add Semester
                    </Button>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredSemesters.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Typography color="text.secondary">
                                No semesters found. Click "Add Semester" to create one.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSemesters.map((sem) => (
                            <TableRow key={sem.id}>
                              <TableCell>{sem.name}</TableCell>
                              <TableCell>
                                {sem.department_id
                                  ? departments.find(d => d.id === sem.department_id)?.name || 'N/A'
                                  : 'All Departments'}
                              </TableCell>
                              <TableCell>{sem.description}</TableCell>
                              <TableCell>
                                <Chip
                                  label={sem.is_active ? 'Active' : 'Inactive'}
                                  color={sem.is_active ? 'success' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <IconButton size="small" onClick={() => handleOpenDialog('semester', sem)}>
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleDelete('semester', sem.id)}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
            </Box>
          </>
        )}
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit' : 'Create'}{' '}
          {dialogType === 'subdomain' ? 'Sub-Domain' : dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder={
                dialogType === 'subdomain'
                  ? 'e.g., Primary School, High School, UG, PG'
                  : dialogType === 'department'
                  ? 'e.g., 1st Grade, Computer Science, Commerce'
                  : dialogType === 'semester'
                  ? 'e.g., Semester 1, Fall 2025'
                  : 'e.g., MIT, Harvard University'
              }
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
            />

            {dialogType === 'subdomain' && (
              <>
                <TextField
                  select
                  fullWidth
                  label="Type"
                  value={formData.type === 'custom' || !['primary', 'high', 'college', 'ug', 'pg', 'phd'].includes(formData.type) ? 'custom' : formData.type}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'custom') {
                      setFormData({ ...formData, type: '' });
                    } else {
                      setFormData({ ...formData, type: value });
                    }
                  }}
                  SelectProps={{ native: true }}
                >
                  <option value="primary">Primary School</option>
                  <option value="high">High School</option>
                  <option value="college">College</option>
                  <option value="ug">Undergraduate (UG)</option>
                  <option value="pg">Postgraduate (PG)</option>
                  <option value="phd">PhD</option>
                  <option value="custom">Custom (Enter your own)</option>
                </TextField>
                
                {(formData.type === '' || !['primary', 'high', 'college', 'ug', 'pg', 'phd'].includes(formData.type)) && (
                  <TextField
                    fullWidth
                    label="Custom Type Name"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g., Diploma, Certificate, Vocational"
                    required
                    helperText="Enter your custom sub-domain type"
                  />
                )}
              </>
            )}

            {dialogType === 'semester' && (
              <TextField
                select
                fullWidth
                label="Department (Optional)"
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                SelectProps={{ native: true }}
                helperText="Leave empty to apply to all departments"
              >
                <option value="">All Departments</option>
                {filteredDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Box>
            {editingItem && dialogType === 'domain' && (
              <Button
                color="error"
                variant="outlined"
                startIcon={<Delete />}
                onClick={() => {
                  handleCloseDialog();
                  handleDelete('domain', editingItem.id);
                }}
              >
                Delete Domain
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.name}
            >
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DomainManagement;
