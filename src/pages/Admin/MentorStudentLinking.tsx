import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Select, MenuItem, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

interface Mentor {
  id: string;
  name: string;
  email: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

interface MentorStudentLink {
  id: string;
  mentor_id: string;
  student_id: string;
  mentor_name: string;
  student_name: string;
  mentoring_focus: string;
  assigned_at: string;
}

const MentorStudentLinking: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [links, setLinks] = useState<MentorStudentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedMentor, setSelectedMentor] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [mentoringFocus, setMentoringFocus] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mentorsRes, studentsRes, linksRes] = await Promise.all([
        fetch('http://localhost:3001/api/mentors'),
        fetch('http://localhost:3001/api/students'),
        fetch('http://localhost:3001/api/mentor-student-links')
      ]);

      const mentorsData = await mentorsRes.json();
      const studentsData = await studentsRes.json();
      const linksData = await linksRes.json();

      setMentors(mentorsData.mentors || []);
      setStudents(studentsData.students || []);
      setLinks(linksData.links || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedMentor || !selectedStudent) {
      setError('Please select both mentor and student');
      return;
    }

    try {
      setError('');
      const response = await fetch('http://localhost:3001/api/mentor-student-links/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentor_id: selectedMentor,
          student_id: selectedStudent,
          mentoring_focus: mentoringFocus || 'General'
        })
      });

      if (!response.ok) throw new Error('Failed to create link');

      setSuccess('Mentor-Student link created successfully');
      setSelectedMentor('');
      setSelectedStudent('');
      setMentoringFocus('');
      setOpenDialog(false);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUnlink = async (linkId: string) => {
    if (!window.confirm('Remove this mentor-student link?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/mentor-student-links/${linkId}`, {
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
        Mentor-Student Linking
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Link mentors to students for mentoring relationships
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
              <TableCell fontWeight={600}>Mentor</TableCell>
              <TableCell fontWeight={600}>Student</TableCell>
              <TableCell fontWeight={600}>Mentoring Focus</TableCell>
              <TableCell fontWeight={600}>Linked Date</TableCell>
              <TableCell fontWeight={600}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {links.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  No mentor-student links yet
                </TableCell>
              </TableRow>
            ) : (
              links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>{link.mentor_name}</TableCell>
                  <TableCell>{link.student_name}</TableCell>
                  <TableCell>{link.mentoring_focus}</TableCell>
                  <TableCell>{new Date(link.assigned_at).toLocaleDateString()}</TableCell>
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
        <DialogTitle>Create Mentor-Student Link</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Select
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="">Select Mentor</MenuItem>
              {mentors.map((mentor) => (
                <MenuItem key={mentor.id} value={mentor.id}>
                  {mentor.name} ({mentor.email})
                </MenuItem>
              ))}
            </Select>

            <Select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="">Select Student</MenuItem>
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </MenuItem>
              ))}
            </Select>

            <TextField
              label="Mentoring Focus"
              placeholder="e.g., Academic, Career, Behavioral"
              value={mentoringFocus}
              onChange={(e) => setMentoringFocus(e.target.value)}
              fullWidth
            />
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

export default MentorStudentLinking;
