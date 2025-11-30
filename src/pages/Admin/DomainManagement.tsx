import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, List, ListItem, ListItemButton,
  ListItemText, InputAdornment, Divider, Card, CardContent, Switch, FormControlLabel,
} from '@mui/material';
import { Add, Edit, Delete, Search, Settings as SettingsIcon } from '@mui/icons-material';

interface Domain {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface SubDomainData {
  id: string;
  domain_id: string;
  name: string;
  type: string;
  department: string;
  semester: string;
  description: string;
  is_active: boolean;
}

const DomainManagement: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [subDomains, setSubDomains] = useState<SubDomainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [domainSearch, setDomainSearch] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openManageDialog, setOpenManageDialog] = useState(false);
  const [openDomainDialog, setOpenDomainDialog] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [managingSubDomain, setManagingSubDomain] = useState<SubDomainData | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'ug',
    department: '',
    semester: '',
    description: '',
    isActive: true,
  });

  const [domainForm, setDomainForm] = useState({ name: '', description: '', isActive: true });

  const typeOptions = [
    { value: 'primary', label: 'Primary School' },
    { value: 'high', label: 'High School' },
    { value: 'college', label: 'College' },
    { value: 'ug', label: 'Undergraduate' },
    { value: 'pg', label: 'Postgraduate' },
    { value: 'phd', label: 'PhD' },
    { value: 'custom', label: 'Custom' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [domainsRes, subDomainsRes, deptsRes, semsRes] = await Promise.all([
        fetch('http://localhost:3001/api/domains'),
        fetch('http://localhost:3001/api/subdomains'),
        fetch('http://localhost:3001/api/departments'),
        fetch('http://localhost:3001/api/semesters'),
      ]);

      const domainsData = await domainsRes.json();
      const subDomainsData = await subDomainsRes.json();
      const deptsData = await deptsRes.json();
      const semsData = await semsRes.json();

      const loadedDomains = domainsData.domains || [];
      setDomains(loadedDomains);

      // Combine data: each subdomain gets first dept and first sem
      const combined = (subDomainsData.subdomains || []).map((sd: any, index: number) => ({
        id: sd.id,
        domain_id: sd.domain_id,
        name: sd.name,
        type: sd.type,
        department: (deptsData.departments || []).filter((d: any) => d.domain_id === sd.domain_id)[index]?.name || 'N/A',
        semester: (semsData.semesters || []).filter((s: any) => s.domain_id === sd.domain_id)[index]?.name || 'N/A',
        description: sd.description || '',
        is_active: sd.is_active,
      }));

      setSubDomains(combined);

      if (!selectedDomain && loadedDomains.length > 0) {
        setSelectedDomain(loadedDomains[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAdd = async () => {
    if (!selectedDomain) return;
    
    try {
      setError('');
      setLoading(true);

      // Create sub-domain
      const subDomainRes = await fetch('http://localhost:3001/api/subdomains/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type === 'custom' ? formData.name : formData.type,
          description: formData.description,
          domain_id: selectedDomain.id,
        }),
      });

      if (!subDomainRes.ok) throw new Error('Failed to create sub-domain');

      // Create department
      await fetch('http://localhost:3001/api/departments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.department,
          description: formData.description,
          domain_id: selectedDomain.id,
        }),
      });

      // Create semester
      await fetch('http://localhost:3001/api/semesters/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.semester,
          description: formData.description,
          domain_id: selectedDomain.id,
        }),
      });

      setSuccess('Sub-Domain created successfully!');
      setOpenAddDialog(false);
      setFormData({ name: '', type: 'ug', department: '', semester: '', description: '', isActive: true });
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
              <Button variant="contained" startIcon={<Add />} onClick={() => { setFormData({ name: '', type: 'ug', department: '', semester: '', description: '', isActive: true }); setOpenAddDialog(true); }}>
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
                        <IconButton size="small" onClick={() => { setManagingSubDomain(sd); setFormData({ name: sd.name, type: sd.type, department: sd.department, semester: sd.semester, description: sd.description, isActive: sd.is_active }); setOpenManageDialog(true); }}>
                          <SettingsIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1, mb: 1 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Type:</Typography>
                        <Typography variant="body2">{typeOptions.find(t => t.value === sd.type)?.label || sd.type}</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Department:</Typography>
                        <Typography variant="body2">{sd.department}</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Semester:</Typography>
                        <Typography variant="body2">{sd.semester}</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Description:</Typography>
                        <Typography variant="body2">{sd.description || 'No description'}</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Status:</Typography>
                        <Typography variant="body2" color={sd.is_active ? 'success.main' : 'text.secondary'}>● {sd.is_active ? 'Active' : 'In-Active'}</Typography>
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
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Add Sub-Domain</Typography>
            <FormControlLabel control={<Switch checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />} label="Active" />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField fullWidth label="Sub-Domain Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g., B.E, B.Tech" />
            <TextField select fullWidth label="Type" value={['primary', 'high', 'college', 'ug', 'pg', 'phd'].includes(formData.type) ? formData.type : 'custom'} onChange={(e) => { if (e.target.value === 'custom') { setFormData({ ...formData, type: '' }); } else { setFormData({ ...formData, type: e.target.value }); } }} SelectProps={{ native: true }}>
              {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </TextField>
            {!['primary', 'high', 'college', 'ug', 'pg', 'phd'].includes(formData.type) && <TextField fullWidth label="Custom Type Name" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} placeholder="e.g., Diploma, Certificate" required />}
            <TextField fullWidth label="Department Name" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required placeholder="e.g., Computer Science" />
            <TextField fullWidth label="Semester Name" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} required placeholder="e.g., Semester 1" />
            <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitAdd} disabled={!formData.name || !formData.department || !formData.semester}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Sub-Domain Dialog */}
      <Dialog open={openManageDialog} onClose={() => setOpenManageDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Manage Sub-Domain</Typography>
            <FormControlLabel control={<Switch checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />} label="Active" />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField fullWidth label="Sub-Domain Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <TextField select fullWidth label="Type" value={['primary', 'high', 'college', 'ug', 'pg', 'phd'].includes(formData.type) ? formData.type : 'custom'} onChange={(e) => { if (e.target.value === 'custom') { setFormData({ ...formData, type: '' }); } else { setFormData({ ...formData, type: e.target.value }); } }} SelectProps={{ native: true }}>
              {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </TextField>
            {!['primary', 'high', 'college', 'ug', 'pg', 'phd'].includes(formData.type) && <TextField fullWidth label="Custom Type Name" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} placeholder="e.g., Diploma, Certificate" required />}
            <TextField fullWidth label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
            <TextField fullWidth label="Semester" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} />
            <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button color="error" variant="outlined" startIcon={<Delete />} onClick={() => { if (managingSubDomain) { setOpenManageDialog(false); handleDeleteSubDomain(managingSubDomain.id); } }}>Delete</Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setOpenManageDialog(false)}>Close</Button>
            <Button variant="contained" onClick={async () => {
              if (!managingSubDomain) return;
              try {
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
              }
            }}>Save Changes</Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Domain Dialog */}
      <Dialog open={openDomainDialog} onClose={() => setOpenDomainDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{editingDomain ? 'Edit Domain' : 'Create Domain'}</Typography>
            <FormControlLabel control={<Switch checked={domainForm.isActive} onChange={(e) => setDomainForm({ ...domainForm, isActive: e.target.checked })} />} label="Active" />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField fullWidth label="Domain Name" value={domainForm.name} onChange={(e) => setDomainForm({ ...domainForm, name: e.target.value })} required />
            <TextField fullWidth label="Description" value={domainForm.description} onChange={(e) => setDomainForm({ ...domainForm, description: e.target.value })} multiline rows={3} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          {editingDomain && (
            <Button
              color="error"
              variant="outlined"
              startIcon={<Delete />}
              onClick={async () => {
                const confirmMessage = 
                  'WARNING: Deleting this domain will also delete:\n' +
                  '- All sub-domains\n' +
                  '- All departments\n' +
                  '- All semesters\n\n' +
                  'Are you sure?';
                
                if (!window.confirm(confirmMessage)) return;

                try {
                  const response = await fetch(`http://localhost:3001/api/domains/${editingDomain.id}`, {
                    method: 'DELETE',
                  });

                  if (!response.ok) throw new Error('Failed to delete domain');

                  setSuccess('Domain deleted successfully!');
                  setOpenDomainDialog(false);
                  setEditingDomain(null);
                  setSelectedDomain(null);
                  await loadData();
                } catch (err: any) {
                  setError(err.message);
                }
              }}
            >
              Delete Domain
            </Button>
          )}
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Button onClick={() => setOpenDomainDialog(false)}>Cancel</Button>
            <Button variant="contained" disabled={!domainForm.name} onClick={async () => {
              try {
                const endpoint = editingDomain 
                  ? `http://localhost:3001/api/domains/${editingDomain.id}`
                  : 'http://localhost:3001/api/domains/create';
                
                const response = await fetch(endpoint, {
                  method: editingDomain ? 'PUT' : 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: domainForm.name,
                    description: domainForm.description,
                    is_active: domainForm.isActive,
                  }),
                });

                if (!response.ok) throw new Error('Failed to save domain');

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
    </Box>
  );
};

export default DomainManagement;
