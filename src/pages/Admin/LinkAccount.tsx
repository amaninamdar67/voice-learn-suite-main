import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, Card, CardContent,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Select, MenuItem, FormControl, InputLabel, Grid,
} from '@mui/material';
import { Add, Delete, Link as LinkIcon, Edit, Close, LinkOff } from '@mui/icons-material';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface StudentParentLink {
  id: string;
  student_id: string;
  parent_id: string;
  relationship: string;
  student_name: string;
  parent_name: string;
}

interface StudentMentorLink {
  id: string;
  student_id: string;
  mentor_id: string;
  student_name: string;
  mentor_name: string;
}

interface ParentMentorLink {
  id: string;
  parent_id: string;
  mentor_id: string;
  student_id: string;
  parent_name: string;
  mentor_name: string;
  student_name: string;
}

interface PermanentStudentCard {
  student_id: string;
  student_name: string;
  order: number;
}

const LinkAccount: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Permanent Student Cards (stored in localStorage)
  const [permanentStudents, setPermanentStudents] = useState<PermanentStudentCard[]>([]);

  // Student-Parent Linking
  const [students, setStudents] = useState<User[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [studentParentLinks, setStudentParentLinks] = useState<StudentParentLink[]>([]);
  const [openStudentParentDialog, setOpenStudentParentDialog] = useState(false);
  const [editingStudentParentLink, setEditingStudentParentLink] = useState<StudentParentLink | null>(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  const [relationship, setRelationship] = useState('guardian');

  // Student-Mentor Linking
  const [mentors, setMentors] = useState<User[]>([]);
  const [studentMentorLinks, setStudentMentorLinks] = useState<StudentMentorLink[]>([]);
  const [openStudentMentorDialog, setOpenStudentMentorDialog] = useState(false);
  const [editingStudentMentorLink, setEditingStudentMentorLink] = useState<StudentMentorLink | null>(null);
  const [selectedStudentForMentor, setSelectedStudentForMentor] = useState('');
  const [selectedMentor, setSelectedMentor] = useState('');

  // Parent-Mentor Linking
  const [parentMentorLinks, setParentMentorLinks] = useState<ParentMentorLink[]>([]);
  const [openParentMentorDialog, setOpenParentMentorDialog] = useState(false);
  const [searchParentMentor, setSearchParentMentor] = useState('');
  const [editingParentMentorLink, setEditingParentMentorLink] = useState<ParentMentorLink | null>(null);
  const [selectedStudentForPM, setSelectedStudentForPM] = useState('');
  const [selectedParentForPM, setSelectedParentForPM] = useState('');
  const [selectedMentorForPM, setSelectedMentorForPM] = useState('');

  useEffect(() => {
    loadPermanentStudents();
    loadData();
  }, []);

  // Load permanent students from localStorage
  const loadPermanentStudents = () => {
    const stored = localStorage.getItem('permanentStudentCards');
    if (stored) {
      setPermanentStudents(JSON.parse(stored));
    }
  };

  // Save permanent students to localStorage
  const savePermanentStudents = (cards: PermanentStudentCard[]) => {
    localStorage.setItem('permanentStudentCards', JSON.stringify(cards));
    setPermanentStudents(cards);
  };

  // Add a new permanent student card
  const addPermanentStudent = (studentId: string, studentName: string) => {
    const newCard: PermanentStudentCard = {
      student_id: studentId,
      student_name: studentName,
      order: permanentStudents.length + 1,
    };
    savePermanentStudents([...permanentStudents, newCard]);
    setSuccess(`Student "${studentName}" added to permanent cards`);
  };

  // Remove a permanent student card
  const removePermanentStudent = (studentId: string) => {
    const updated = permanentStudents
      .filter(card => card.student_id !== studentId)
      .map((card, idx) => ({ ...card, order: idx + 1 }));
    savePermanentStudents(updated);
  };

  // Get parent names for a student
  const getParentNamesForStudent = (studentId: string): string => {
    const links = studentParentLinks.filter(link => link.student_id === studentId);
    if (links.length === 0) return 'no parent linked';
    return links.map(link => link.parent_name).join(', ');
  };

  // Get mentor names for a student
  const getMentorNamesForStudent = (studentId: string): string => {
    const links = studentMentorLinks.filter(link => link.student_id === studentId);
    if (links.length === 0) return 'no mentor linked';
    return links.map(link => link.mentor_name).join(', ');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [studentsRes, parentsRes, mentorsRes, spLinksRes, smLinksRes, pmLinksRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin-linking/users?role=student').catch(() => null),
        fetch('http://localhost:3001/api/admin-linking/users?role=parent').catch(() => null),
        fetch('http://localhost:3001/api/admin-linking/users?role=mentor').catch(() => null),
        fetch('http://localhost:3001/api/admin-linking/parent-student-links').catch(() => null),
        fetch('http://localhost:3001/api/admin-linking/student-mentor-links').catch(() => null),
        fetch('http://localhost:3001/api/admin-linking/parent-mentor-links').catch(() => null),
      ]);

      if (!studentsRes || !parentsRes || !mentorsRes || !spLinksRes || !smLinksRes || !pmLinksRes) {
        throw new Error('Failed to connect to backend server');
      }

      if (!studentsRes.ok || !parentsRes.ok || !mentorsRes.ok || !spLinksRes.ok || !smLinksRes.ok || !pmLinksRes.ok) {
        throw new Error('Failed to fetch data from server');
      }

      const studentsData = await studentsRes.json();
      const parentsData = await parentsRes.json();
      const mentorsData = await mentorsRes.json();
      const spLinksData = await spLinksRes.json();
      const smLinksData = await smLinksRes.json();
      const pmLinksData = await pmLinksRes.json();

      setStudents(studentsData.users || []);
      setParents(parentsData.users || []);
      setMentors(mentorsData.users || []);
      setStudentParentLinks(spLinksData.links || []);
      setStudentMentorLinks(smLinksData.links || []);
      setParentMentorLinks(pmLinksData.links || []);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Make sure the backend server is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  const filteredParentMentorLinks = parentMentorLinks.filter(link =>
    link.parent_name?.toLowerCase().includes(searchParentMentor.toLowerCase()) ||
    link.mentor_name?.toLowerCase().includes(searchParentMentor.toLowerCase()) ||
    link.student_name?.toLowerCase().includes(searchParentMentor.toLowerCase())
  );

  const handleLinkStudentParent = async () => {
    if (!selectedStudent || !selectedParent) {
      setError('Please select both student and parent');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/admin-linking/parent-student-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudent,
          parent_id: selectedParent,
          relationship,
        }),
      });

      if (!res.ok) throw new Error('Failed to create link');

      setSuccess('Student-Parent link created successfully!');
      setOpenStudentParentDialog(false);
      setEditingStudentParentLink(null);
      setSelectedStudent('');
      setSelectedParent('');
      setRelationship('guardian');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudentParentLink = (link: StudentParentLink) => {
    setEditingStudentParentLink(link);
    setSelectedStudent(link.student_id);
    setSelectedParent(link.parent_id);
    setRelationship(link.relationship);
    setOpenStudentParentDialog(true);
  };

  const handleUpdateStudentParentLink = async () => {
    if (!editingStudentParentLink || !selectedStudent || !selectedParent) {
      setError('Please select both student and parent');
      return;
    }

    try {
      setLoading(true);
      // Delete old link
      await fetch(`http://localhost:3001/api/admin-linking/parent-student-links/${editingStudentParentLink.id}`, {
        method: 'DELETE',
      });

      // Create new link
      const res = await fetch('http://localhost:3001/api/admin-linking/parent-student-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudent,
          parent_id: selectedParent,
          relationship,
        }),
      });

      if (!res.ok) throw new Error('Failed to update link');

      setSuccess('Student-Parent link updated successfully!');
      setOpenStudentParentDialog(false);
      setEditingStudentParentLink(null);
      setSelectedStudent('');
      setSelectedParent('');
      setRelationship('guardian');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkStudentMentor = async () => {
    if (!selectedStudentForMentor || !selectedMentor) {
      setError('Please select both student and mentor');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/admin-linking/student-mentor-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudentForMentor,
          mentor_id: selectedMentor,
        }),
      });

      if (!res.ok) throw new Error('Failed to create link');

      setSuccess('Student-Mentor link created successfully!');
      setOpenStudentMentorDialog(false);
      setEditingStudentMentorLink(null);
      setSelectedStudentForMentor('');
      setSelectedMentor('');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudentMentorLink = (link: StudentMentorLink) => {
    setEditingStudentMentorLink(link);
    setSelectedStudentForMentor(link.student_id);
    setSelectedMentor(link.mentor_id);
    setOpenStudentMentorDialog(true);
  };

  const handleUpdateStudentMentorLink = async () => {
    if (!editingStudentMentorLink || !selectedStudentForMentor || !selectedMentor) {
      setError('Please select both student and mentor');
      return;
    }

    try {
      setLoading(true);
      // Delete old link
      await fetch(`http://localhost:3001/api/admin-linking/student-mentor-links/${editingStudentMentorLink.id}`, {
        method: 'DELETE',
      });

      // Create new link
      const res = await fetch('http://localhost:3001/api/admin-linking/student-mentor-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudentForMentor,
          mentor_id: selectedMentor,
        }),
      });

      if (!res.ok) throw new Error('Failed to update link');

      setSuccess('Student-Mentor link updated successfully!');
      setOpenStudentMentorDialog(false);
      setEditingStudentMentorLink(null);
      setSelectedStudentForMentor('');
      setSelectedMentor('');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudentParentLink = async (id: string) => {
    if (!window.confirm('Delete this link?')) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3001/api/admin-linking/parent-student-links/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete link');

      setSuccess('Link deleted successfully!');
      setEditingStudentParentLink(null);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudentMentorLink = async (id: string) => {
    if (!window.confirm('Delete this link?')) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3001/api/admin-linking/student-mentor-links/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete link');

      setSuccess('Link deleted successfully!');
      setEditingStudentMentorLink(null);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditParentMentorLink = (link: ParentMentorLink) => {
    setEditingParentMentorLink(link);
    setSelectedStudentForPM(link.student_id);
    setSelectedParentForPM(link.parent_id);
    setSelectedMentorForPM(link.mentor_id);
    setOpenParentMentorDialog(true);
  };

  const handleSaveParentMentorLink = async () => {
    if (!selectedStudentForPM || !selectedParentForPM || !selectedMentorForPM) {
      setError('Please select student, parent, and mentor');
      return;
    }

    try {
      setLoading(true);

      // If editing, delete old link first
      if (editingParentMentorLink) {
        await fetch(`http://localhost:3001/api/admin-linking/parent-mentor-links/${editingParentMentorLink.id}`, {
          method: 'DELETE',
        });
      }

      // Create new link
      const res = await fetch('http://localhost:3001/api/admin-linking/parent-mentor-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_id: selectedParentForPM,
          mentor_id: selectedMentorForPM,
          student_id: selectedStudentForPM,
        }),
      });

      if (!res.ok) throw new Error('Failed to save link');

      setSuccess(editingParentMentorLink ? 'Link updated successfully!' : 'Link created successfully!');
      setOpenParentMentorDialog(false);
      setEditingParentMentorLink(null);
      setSelectedStudentForPM('');
      setSelectedParentForPM('');
      setSelectedMentorForPM('');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParentMentorLink = async (id: string) => {
    if (!window.confirm('Delete this link?')) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3001/api/admin-linking/parent-mentor-links/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete link');

      setSuccess('Link deleted successfully!');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete all links for a student
  const handleDeleteAllStudentLinks = async (studentId: string) => {
    const studentName = permanentStudents.find(s => s.student_id === studentId)?.student_name;
    
    if (!window.confirm(`⚠️ WARNING: This will delete ALL links for ${studentName}:\n- All parent links\n- All mentor links\n\nThis action cannot be undone. Continue?`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Delete all parent links for this student
      const parentLinks = studentParentLinks.filter(link => link.student_id === studentId);
      for (const link of parentLinks) {
        await fetch(`http://localhost:3001/api/admin-linking/parent-student-links/${link.id}`, {
          method: 'DELETE',
        });
      }

      // Delete all mentor links for this student
      const mentorLinks = studentMentorLinks.filter(link => link.student_id === studentId);
      for (const link of mentorLinks) {
        await fetch(`http://localhost:3001/api/admin-linking/student-mentor-links/${link.id}`, {
          method: 'DELETE',
        });
      }

      // Remove from permanent cards
      removePermanentStudent(studentId);

      setSuccess(`All links for ${studentName} have been deleted`);
      await loadData();
    } catch (err: any) {
      setError(`Failed to delete links: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get unlinked students
  const unlinkedStudents = students.filter(s => !permanentStudents.find(p => p.student_id === s.id));
  const linkedStudentsData = permanentStudents;

  // Handle creating link form
  const handleOpenLinkForm = (studentId: string, isEditing: boolean = false) => {
    setSelectedStudentForMentor(studentId);
    setSelectedStudent(studentId);
    
    // Find the existing links for this student
    const parentLink = studentParentLinks.find(l => l.student_id === studentId);
    const mentorLink = studentMentorLinks.find(l => l.student_id === studentId);
    
    if (parentLink && mentorLink) {
      // Links exist - set them as current values
      setSelectedParent(parentLink.parent_id);
      setSelectedMentor(mentorLink.mentor_id);
      setRelationship(parentLink.relationship);
      
      // Set editing mode with both link objects
      setEditingStudentMentorLink({
        id: mentorLink.id,
        student_id: studentId,
        mentor_id: mentorLink.mentor_id,
        student_name: mentorLink.student_name,
        mentor_name: mentorLink.mentor_name,
      });
      
      // Store parent link ID for update
      (window as any).editingParentLinkId = parentLink.id;
    } else {
      // No existing links - clear form for new linking
      setSelectedParent('');
      setSelectedMentor('');
      setRelationship('guardian');
      setEditingStudentMentorLink(null);
      (window as any).editingParentLinkId = null;
    }
    
    setOpenStudentMentorDialog(true);
  };

  // Handle linking all 3 at once
  const handleLinkAll = async () => {
    if (!selectedStudent || !selectedParent || !selectedMentor) {
      setError('Please select student, parent, and mentor');
      return;
    }

    try {
      setLoading(true);
      const isEditing = editingStudentMentorLink !== null;

      if (isEditing) {
        // Update existing links - delete old and create new
        const parentLinkId = (window as any).editingParentLinkId;
        const mentorLinkId = editingStudentMentorLink?.id;
        
        // Get old parent and mentor IDs for cleanup
        const oldParentLink = studentParentLinks.find(l => l.student_id === selectedStudent);
        const oldMentorLink = studentMentorLinks.find(l => l.student_id === selectedStudent);
        const oldParentId = oldParentLink?.parent_id;
        const oldMentorId = oldMentorLink?.mentor_id;

        // Find all other students that have the NEW parent (to clean up their old messages)
        const otherStudentsWithNewParent = studentParentLinks.filter(
          l => l.parent_id === selectedParent && l.student_id !== selectedStudent
        );

        // Delete old parent link
        if (parentLinkId) {
          await fetch(`http://localhost:3001/api/admin-linking/parent-student-links/${parentLinkId}`, {
            method: 'DELETE',
          });
        }

        // Delete old mentor link
        if (mentorLinkId) {
          await fetch(`http://localhost:3001/api/admin-linking/student-mentor-links/${mentorLinkId}`, {
            method: 'DELETE',
          });
        }

        // Create new parent link
        await fetch('http://localhost:3001/api/admin-linking/parent-student-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: selectedStudent,
            parent_id: selectedParent,
            relationship,
          }),
        });

        // Create new mentor link
        await fetch('http://localhost:3001/api/admin-linking/student-mentor-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: selectedStudent,
            mentor_id: selectedMentor,
          }),
        });

        // Clean up old messages from previous parent for THIS student (if parent changed)
        if (oldParentId && oldParentId !== selectedParent) {
          try {
            await fetch(`http://localhost:3001/api/mentor-parent/cleanup-messages/parent/${selectedStudent}/${oldParentId}`, {
              method: 'POST',
            });
          } catch (err) {
            console.error('Error cleaning up parent messages for current student:', err);
          }
        }

        // Clean up messages from new parent for OTHER students (since parent is now reassigned)
        for (const otherLink of otherStudentsWithNewParent) {
          try {
            await fetch(`http://localhost:3001/api/mentor-parent/cleanup-messages/parent/${otherLink.student_id}/${selectedParent}`, {
              method: 'POST',
            });
          } catch (err) {
            console.error('Error cleaning up parent messages for other student:', err);
          }
        }

        // Clean up old messages from previous mentor (if mentor changed)
        if (oldMentorId && oldMentorId !== selectedMentor) {
          try {
            await fetch(`http://localhost:3001/api/mentor-parent/cleanup-messages/mentor/${selectedStudent}/${oldMentorId}/${oldParentId}`, {
              method: 'POST',
            });
          } catch (err) {
            console.error('Error cleaning up mentor messages:', err);
          }
        }

        setSuccess('Links updated successfully! Messages from old relationships have been cleared.');
      } else {
        // Create new links
        // Create parent link
        await fetch('http://localhost:3001/api/admin-linking/parent-student-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: selectedStudent,
            parent_id: selectedParent,
            relationship,
          }),
        });

        // Create mentor link
        await fetch('http://localhost:3001/api/admin-linking/student-mentor-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: selectedStudent,
            mentor_id: selectedMentor,
          }),
        });

        setSuccess('All links created successfully!');
      }

      setOpenStudentMentorDialog(false);
      setEditingStudentMentorLink(null);
      (window as any).editingParentLinkId = null;
      setSelectedStudent('');
      setSelectedParent('');
      setSelectedMentor('');
      setRelationship('guardian');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle unlinking all relationships for a student
  const handleUnlinkAll = async () => {
    if (!editingStudentMentorLink) {
      setError('No link to unlink');
      return;
    }

    if (!window.confirm('⚠️ WARNING: This will unlink the student from all parents and mentors. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const studentId = editingStudentMentorLink.student_id;

      // Get all parent and mentor links before deletion (for cleanup)
      const parentLinks = studentParentLinks.filter(link => link.student_id === studentId);
      const mentorLinks = studentMentorLinks.filter(link => link.student_id === studentId);

      // Delete all parent links for this student
      for (const link of parentLinks) {
        await fetch(`http://localhost:3001/api/admin-linking/parent-student-links/${link.id}`, {
          method: 'DELETE',
        });
      }

      // Delete all mentor links for this student
      for (const link of mentorLinks) {
        await fetch(`http://localhost:3001/api/admin-linking/student-mentor-links/${link.id}`, {
          method: 'DELETE',
        });
      }

      // Clean up ALL messages for this student
      try {
        console.log('Cleaning up ALL messages for student:', studentId);
        const cleanupRes = await fetch(`http://localhost:3001/api/mentor-parent/cleanup-messages/student/${studentId}`, {
          method: 'POST',
        });
        const cleanupData = await cleanupRes.json();
        console.log('Student cleanup response:', cleanupData);
      } catch (err) {
        console.error('Error cleaning up student messages:', err);
      }

      // Remove from permanent cards
      removePermanentStudent(studentId);

      setSuccess('Student unlinked successfully! All messages from parents and mentors have been deleted.');
      setOpenStudentMentorDialog(false);
      setEditingStudentMentorLink(null);
      setSelectedStudent('');
      setSelectedParent('');
      setSelectedMentor('');
      setRelationship('guardian');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to unlink');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Link Accounts
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage relationships between students, parents, and mentors for data flow and analytics
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Un-Linked Students" />
          <Tab label="Linked Students" />
          <Tab label="Link Info" />
        </Tabs>
      </Paper>

      {/* TAB 1: UN-LINKED STUDENTS */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Un-Linked Students
          </Typography>
          
          {unlinkedStudents.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">All students are linked</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
              {unlinkedStudents.map((student) => (
                <Paper
                  key={student.id}
                  sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {student.full_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {student.email}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => {
                      addPermanentStudent(student.id, student.full_name);
                    }}
                  >
                    Create Link
                  </Button>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* TAB 2: LINKED STUDENTS */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Linked Students
          </Typography>
          
          {linkedStudentsData.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No linked students yet</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
              {linkedStudentsData.map((card) => (
                <Paper
                  key={card.student_id}
                  sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: '#e8eaf6',
                    border: '1px solid #6366f1',
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {card.order}. {card.student_name}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpenLinkForm(card.student_id)}
                  >
                    Link
                  </Button>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* TAB 3: LINK INFO */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Link Info
          </Typography>
          
          {linkedStudentsData.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No linked students to display</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
              {linkedStudentsData.map((card) => {
                const parentLink = studentParentLinks.find(l => l.student_id === card.student_id);
                const mentorLink = studentMentorLinks.find(l => l.student_id === card.student_id);
                
                // Only show if both parent and mentor are linked
                if (!parentLink || !mentorLink) return null;
                
                return (
                  <Paper
                    key={card.student_id}
                    sx={{
                      p: 2,
                      bgcolor: '#f0f4ff',
                      border: '1px solid #6366f1',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {card.student_name}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenLinkForm(card.student_id, true)}
                        title="Edit"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ bgcolor: 'white', p: 1.5, borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        <strong>Parent:</strong> {parentLink.parent_name}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        <strong>Relationship:</strong> {parentLink.relationship}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        <strong>Mentor:</strong> {mentorLink.mentor_name}
                      </Typography>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Box>
      )}





      {/* UNIFIED LINK FORM DIALOG - Link all 3 at once */}
      <Dialog open={openStudentMentorDialog} onClose={() => { setOpenStudentMentorDialog(false); setEditingStudentMentorLink(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Link Student with Parent & Mentor</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {/* Student (Read-only) */}
            <FormControl fullWidth disabled>
              <InputLabel>Student</InputLabel>
              <Select
                value={selectedStudent}
                label="Student"
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.full_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Parent Selection */}
            <FormControl fullWidth>
              <InputLabel>Select Parent</InputLabel>
              <Select
                value={selectedParent}
                onChange={(e) => setSelectedParent(e.target.value)}
                label="Select Parent"
              >
                <MenuItem value="">None</MenuItem>
                {parents.map((parent) => (
                  <MenuItem key={parent.id} value={parent.id}>
                    {parent.full_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Relationship Type */}
            <FormControl fullWidth>
              <InputLabel>Relationship</InputLabel>
              <Select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                label="Relationship"
              >
                <MenuItem value="guardian">Guardian</MenuItem>
                <MenuItem value="mother">Mother</MenuItem>
                <MenuItem value="father">Father</MenuItem>
                <MenuItem value="sibling">Sibling</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            {/* Mentor Selection */}
            <FormControl fullWidth>
              <InputLabel>Select Mentor</InputLabel>
              <Select
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
                label="Select Mentor"
              >
                <MenuItem value="">None</MenuItem>
                {mentors.map((mentor) => (
                  <MenuItem key={mentor.id} value={mentor.id}>
                    {mentor.full_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          {editingStudentMentorLink && (
            <Button
              color="error"
              startIcon={<LinkOff />}
              onClick={handleUnlinkAll}
              disabled={loading}
            >
              {loading ? 'Unlinking...' : 'Unlink'}
            </Button>
          )}
          
          {!editingStudentMentorLink && <Box />}
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => { setOpenStudentMentorDialog(false); setEditingStudentMentorLink(null); (window as any).editingParentLinkId = null; }}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleLinkAll}
              disabled={!selectedStudent || !selectedParent || !selectedMentor || loading}
            >
              {loading ? (editingStudentMentorLink ? 'Updating...' : 'Linking...') : (editingStudentMentorLink ? 'Update Links' : 'Link All')}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default LinkAccount;
