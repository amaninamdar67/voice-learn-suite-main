import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Card,
  CardContent,
  IconButton,
  Chip,
  LinearProgress,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Edit,
  Search,
  InsertDriveFile,
  PictureAsPdf,
  VideoLibrary,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface UploadedLesson {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'document';
  size: string;
  uploadDate: string;
  views: number;
}

const LessonUpload: React.FC = () => {
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [lessons, setLessons] = useState<UploadedLesson[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Upload dialog state
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    subject: '',
  });

  // Teacher's profile data
  const [teacherProfile, setTeacherProfile] = useState<any>(null);

  useEffect(() => {
    loadTeacherProfile();
    loadLessons();
  }, [user]);

  const loadTeacherProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setTeacherProfile(data);
    } catch (err: any) {
      console.error('Error loading profile:', err);
    }
  };

  const loadLessons = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:3001/api/lessons?teacherId=${user.id}`);
      const data = await response.json();
      
      if (data.lessons) {
        const formattedLessons: UploadedLesson[] = data.lessons.map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description || '',
          type: lesson.document_type || 'document',
          size: lesson.file_size ? `${(lesson.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A',
          uploadDate: new Date(lesson.created_at).toLocaleDateString(),
          views: 0,
        }));
        setLessons(formattedLessons);
      }
    } catch (err: any) {
      console.error('Error loading lessons:', err);
      setError('Failed to load lessons');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const maxSize = 15 * 1024 * 1024; // 15MB in bytes
      
      if (file.size > maxSize) {
        setError(`File size exceeds 15MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        setTimeout(() => setError(''), 5000);
        return;
      }
      
      setSelectedFile(file);
      setOpenUploadDialog(true);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 15 * 1024 * 1024; // 15MB in bytes
      
      if (file.size > maxSize) {
        setError(`File size exceeds 15MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        setTimeout(() => setError(''), 5000);
        return;
      }
      
      setSelectedFile(file);
      setOpenUploadDialog(true);
    }
  };

  const handleUploadLesson = async () => {
    if (!selectedFile || !user || !teacherProfile) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Step 1: Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${selectedFile.name}`;
      
      setUploadProgress(10);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lesson-files')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      setUploadProgress(50);

      // Step 2: Get public URL
      const { data: urlData } = supabase.storage
        .from('lesson-files')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get file URL');
      }

      setUploadProgress(70);

      // Step 3: Save lesson metadata to database
      const response = await fetch('http://localhost:3001/api/lessons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lessonData.title,
          description: lessonData.description,
          teacherId: user.id,
          subject: lessonData.subject,
          documentUrl: urlData.publicUrl,
          documentName: selectedFile.name,
          documentType: fileExt,
          fileSize: selectedFile.size,
          domain_id: teacherProfile.domain_id,
          sub_domain_id: teacherProfile.sub_domain_id,
          department_id: teacherProfile.department_id,
          semester_id: teacherProfile.semester_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to save lesson metadata');

      setUploadProgress(100);
      setSuccess('Lesson uploaded successfully!');
      
      // Reset form
      setTimeout(() => {
        setOpenUploadDialog(false);
        setSelectedFile(null);
        setLessonData({ title: '', description: '', subject: '' });
        setUploadProgress(0);
      }, 1000);
      
      await loadLessons();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload lesson');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    try {
      // First, get the lesson to find the file URL
      const lesson = lessons.find(l => l.id === id);
      
      // Delete from database
      const response = await fetch(`http://localhost:3001/api/lessons/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete lesson');
      }

      // If lesson has a real file (not temp), delete from storage
      if (lesson && data.filePath) {
        const { error: storageError } = await supabase.storage
          .from('lesson-files')
          .remove([data.filePath]);
        
        if (storageError) {
          console.error('Failed to delete file from storage:', storageError);
          // Don't throw error - lesson is already deleted from DB
        }
      }

      setSuccess('Lesson deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      await loadLessons();
    } catch (err: any) {
      setError(err.message || 'Failed to delete lesson');
      setTimeout(() => setError(''), 5000);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <PictureAsPdf color="error" />;
      case 'video':
        return <VideoLibrary color="primary" />;
      default:
        return <InsertDriveFile color="action" />;
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || lesson.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Lesson Upload & Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload and organize your course materials
      </Typography>

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

      {/* Upload Area */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleFileInput}
        />
        
        <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drag & Drop files here
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          or click to browse
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Supported formats: PDF, DOC, DOCX, PPT, PPTX, Images (JPG, PNG, GIF), TXT, Excel
        </Typography>
        <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
          Maximum file size: 15 MB
        </Typography>

        {uploading && (
          <Box sx={{ mt: 3, maxWidth: 400, mx: 'auto' }}>
            <Typography variant="body2" gutterBottom>
              Uploading... {uploadProgress}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}
      </Paper>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            select
            size="small"
            label="Type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="pdf">PDF</MenuItem>
            <MenuItem value="video">Video</MenuItem>
            <MenuItem value="document">Document</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Uploaded Lessons List */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Uploaded Lessons ({filteredLessons.length})
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredLessons.map((lesson) => (
          <Card key={lesson.id}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    borderRadius: 2,
                  }}
                >
                  {getFileIcon(lesson.type)}
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {lesson.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {lesson.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(lesson.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Chip
                      label={lesson.type.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Size: {lesson.size}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Uploaded: {lesson.uploadDate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Views: {lesson.views}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {filteredLessons.length === 0 && (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <InsertDriveFile sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No lessons found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload your first lesson to get started
          </Typography>
        </Paper>
      )}

      {/* Upload Dialog */}
      <Dialog open={openUploadDialog} onClose={() => !uploading && setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Lesson</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Alert severity="info">
              File: {selectedFile?.name} ({selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB)
            </Alert>

            <TextField
              fullWidth
              label="Lesson Title"
              value={lessonData.title}
              onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Description"
              value={lessonData.description}
              onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              label="Subject"
              value={lessonData.subject}
              onChange={(e) => setLessonData({ ...lessonData, subject: e.target.value })}
              required
              placeholder="e.g., Mathematics, Physics, Computer Science"
            />

            <Alert severity="info">
              Max file size: 15 MB | Document will remain until you delete it
            </Alert>

            {teacherProfile && (
              <Alert severity="success">
                This lesson will be available to students in your domain, department, and semester
              </Alert>

            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadLesson}
            disabled={!lessonData.title || !lessonData.subject || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Lesson'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LessonUpload;
