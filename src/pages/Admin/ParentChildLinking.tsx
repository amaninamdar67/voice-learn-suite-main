import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Select, MenuItem, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

interface Parent {
  id: string;
  name: string;
  email: string;
}

interface Child {
  id: string;
  name: string;
  email: string;
}

interface ParentChildLink {
  id: string;
  parent_id: string;
  student_id: string;
  parent_name: string;
  student_name: string;
  relationship_type: string;
  linked_at: string;
}

const ParentChildLinking: React.FC = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [links, setLinks] = useState<ParentChildLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedParent, setSelectedParent] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [relationshipType, setRelationshipType] = useState('parent');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [parentsRes, childrenRes, linksRes] = await Promise.all([
        fetch('http://localhost:3001/api/parents'),
        fetch('http://localhost:3001/api/children'),
        fetch('http://localhost:3001/api/parent-child-links')
      ]);

      const parentsData = await parentsRes.json();
      const childrenData = await childrenRes.json();
      const linksData = await linksRes.json();

      setParents(parentsData.parents || []);
      setChildren(childrenData.children || []);
      setLinks(linksData.links || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedParent || !selectedChild) {
      setError('Please select both parent and child');
      return;
    }

    try {
      setError('');
      const response = await fetch('http://localhost:3001/api/parent-child-links/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_id: selectedParent,
          student_id: selectedChild,
          relationship_type: relationshipType
        })
      });

      if (!response.ok) throw new Error('Failed to create link');

      setSuccess('Parent-Child link created successfully');
      setSelectedParent('');
      setSelectedChild('');
      setRelationshipType('parent');
      setOpenDialog(false);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUnlink = async (linkId: string) => {
    if (!window.confirm('Remove this parent-child link?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/parent-child-links/${linkId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete link');

      setSuccess('Link removed successfully');
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Parent-Child Linking
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Link parents to their children for family relationships
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 3 }}
      >
        Create Link
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell fontWeight={600}>Parent</TableCell>
              <TableCell fontWeight={600}>Child</TableCell>
              <TableCell fontWeight={600}>Relationship</TableCell>
              <TableCell fontWeight={600}>Linked Date</TableCell>
              <TableCell fontWeight={600}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {links.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  No parent-child links yet
                </TableCell>
              </TableRow>
            ) : (
              links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>{link.parent_name}</TableCell>
                  <TableCell>{link.student_name}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>
                    {link.relationship_type}
                  </TableCell>
                  <TableCell>{new Date(link.linked_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleUnlink(link.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Parent-Child Link</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Select
              value={selectedParent}
              onChange={(e) => setSelectedParent(e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="">Select Parent</MenuItem>
              {parents.map((parent) => (
                <MenuItem key={parent.id} value={parent.id}>
                  {parent.name} ({parent.email})
                </MenuItem>
              ))}
            </Select>

            <Select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="">Select Child</MenuItem>
              {children.map((child) => (
                <MenuItem key={child.id} value={child.id}>
                  {child.name} ({child.email})
                </MenuItem>
              ))}
            </Select>

            <Select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value)}
              fullWidth
            >
              <MenuItem value="parent">Parent</MenuItem>
              <MenuItem value="guardian">Guardian</MenuItem>
              <MenuItem value="foster_parent">Foster Parent</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleLink}>
            Create Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParentChildLinking;
