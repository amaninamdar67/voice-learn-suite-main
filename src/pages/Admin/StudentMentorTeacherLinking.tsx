import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Chip,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, Delete, Link as LinkIcon } from '@mui/icons-material';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Link {
  id: string;
  student_id: string;
  mentor_id?: string;
  teacher_id?: string;
  student_name: string;
  linked_name: string;
  link_type: 'mentor' | 'teacher';
}

const StudentMentorTeacherLinking: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [linkType, setLinkType] = useState<'mentor' | 'teacher'>('mentor');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedLinked, setSelectedLinked] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/users');
      const data = await response.json();

      if (data.users) {
        const allUsers = data.users;
        setStudents(allUsers.filter((u: any) => u.role === 'student'));
        setMentors(allUsers.filter((u: any) => u.role === 'mentor'));
        setTeachers(allUsers.filter((u: any) => u.role === 'teacher'));
      }

      // Load existing links
      const linksResponse = await fetch('http://localhost:3001/api/student-links');
      const linksData = await linksResponse.json();
      setLinks(linksData.links || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    if (!selectedStudent || !selectedLinked) {
      setError('Please select both student and ' + linkType);
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        student_id: selectedStudent,
        link_type: linkType,
      };

      if (linkType === 'mentor') {
        payload.mentor_id = selectedLinked;
      } else {
        payload.teacher_id = selectedLinked;
      }

      const response = await fetch('http://localhost:3001/api/student-links/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create link');
      }

      setSuccess(`Link created successfully!`);
      setOpenDialog(false);
      setSelectedStudent('');
      setSelectedLinked('');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!window.confirm('Delete this link?')) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/student-links/${linkId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete link');

      setSuccess('Link deleted successfully!');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const linkedUsers = linkType === 'mentor' ? mentors : teachers;

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
            Student Linking
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Link students with mentors and teachers
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Create Link
        </Button>
      </Box>

      {/* Links Display */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, mb: 4 }}>
        {links.map((link) => (
          <Card key={link.id} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Student
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {link.student_name}
                  </Typography>
                </Box>
                <Chip
                  label={link.link_type === 'mentor' ? 'Mentor' : 'Teacher'}
                  size="small"
                  color={link.link_type === 'mentor' ? 'primary' : 'secondary'}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {link.link_type === 'mentor' ? 'Mentor' : 'Teacher'}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {link.linked_name}
                </Typography>
              </Box>

              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={() => handleDeleteLink(link.id)}
                fullWidth
              >
                Remove Link
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      {links.length === 0 && (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No links created yet
          </Typography>
        </Paper>
      )}

      {/* Create Link Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Student Link</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Link Type"
              value={linkType}
              onChange={(e) => {
                setLinkType(e.target.value as 'mentor' | 'teacher');
                setSelectedLinked('');
              }}
            >
              <MenuItem value="mentor">Mentor</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              label="Select Student"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <MenuItem value="">Choose a student...</MenuItem>
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label={`Select ${linkType === 'mentor' ? 'Mentor' : 'Teacher'}`}
              value={selectedLinked}
              onChange={(e) => setSelectedLinked(e.target.value)}
            >
              <MenuItem value="">Choose a {linkType}...</MenuItem>
              {linkedUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateLink}
            disabled={!selectedStudent || !selectedLinked || loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Creating...' : 'Create Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentMentorTeacherLinking;
