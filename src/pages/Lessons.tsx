import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search,
  VolumeUp,
  Description,
  Download,
  Add,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import { useVoiceContent } from '../hooks/useVoiceContent';
import { useNavigate } from 'react-router-dom';

interface Lesson {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  section: string;
  document_url: string;
  document_name: string;
  document_type: string;
  file_size: number;
  teacher_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

const Lessons: React.FC = () => {
  const { user } = useAuth();
  const { speak, isSpeaking } = useSpeech();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLessons();
  }, [user]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/lessons');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load lessons');
      }
      
      setLessons(data.lessons || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReadAloud = (text: string) => {
    speak(text);
  };

  const handleDownload = (lesson: Lesson) => {
    // Check if it's a temporary URL (not uploaded yet)
    if (!lesson.document_url || lesson.document_url.startsWith('temp_')) {
      const message = 'File not available: This lesson has been created but the file has not been uploaded yet.';
      speak(message);
      setError(message);
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    // Open document in new tab
    window.open(lesson.document_url, '_blank');
    speak(`Opening ${lesson.title}`);
  };

  const handleAnalyzeDocument = (lesson: Lesson) => {
    // Open AI Tutor with document analysis
    speak('Opening AI Tutor to analyze this document');
    
    // Dispatch event to open AI Tutor
    window.dispatchEvent(new CustomEvent('open-ai-tutor', { 
      detail: { 
        action: 'analyze',
        document: {
          title: lesson.title,
          url: lesson.document_url,
          type: lesson.document_type,
        }
      } 
    }));
  };

  const handleLessonSelect = (index: number) => {
    const lesson = filteredLessons[index];
    if (lesson) {
      handleDownload(lesson);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    return <Description />;
  };

  // Enable voice content reading
  useVoiceContent(
    filteredLessons.map((lesson, idx) => ({ title: lesson.title, index: idx })),
    handleLessonSelect
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            {user?.role === 'teacher' ? 'Manage Lessons' : 'Study Materials'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.role === 'teacher' 
              ? 'Upload and manage study materials (PDFs, documents, notes)'
              : 'Access your course materials and study notes'}
          </Typography>
        </Box>
        {user?.role === 'teacher' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/lessons/upload')}
          >
            Upload & Manage
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        placeholder="Search lessons by title, subject, or description..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {filteredLessons.map((lesson) => (
          <Card
            key={lesson.id}
            sx={{
              cursor: lesson.document_url?.startsWith('temp_') ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              opacity: lesson.document_url?.startsWith('temp_') ? 0.6 : 1,
              '&:hover': {
                transform: lesson.document_url?.startsWith('temp_') ? 'none' : 'translateY(-4px)',
                boxShadow: lesson.document_url?.startsWith('temp_') ? 3 : 6,
              },
            }}
            onClick={() => handleDownload(lesson)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
                  {getFileIcon(lesson.document_type)}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="div" fontWeight={600}>
                      {lesson.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {lesson.profiles?.full_name || 'Teacher'}
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReadAloud(`${lesson.title}. ${lesson.description || 'No description'}. Subject: ${lesson.subject}`);
                  }}
                  color={isSpeaking ? 'primary' : 'default'}
                >
                  <VolumeUp fontSize="small" />
                </IconButton>
              </Box>
              
              {lesson.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {lesson.description}
                </Typography>
              )}

              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip label={lesson.subject} size="small" color="primary" variant="outlined" />
                {lesson.grade && <Chip label={lesson.grade} size="small" variant="outlined" />}
                {lesson.section && <Chip label={`Section ${lesson.section}`} size="small" variant="outlined" />}
                {lesson.document_url?.startsWith('temp_') && (
                  <Chip 
                    label="File Not Available" 
                    size="small" 
                    color="error"
                    variant="filled" 
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {lesson.document_name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Download fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(lesson.file_size)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {filteredLessons.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {lessons.length === 0 ? 'No lessons available yet' : 'No lessons found matching your search'}
          </Typography>
          {user?.role === 'teacher' && lessons.length === 0 && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/lessons/upload')}
              sx={{ mt: 2 }}
            >
              Upload First Material
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Lessons;
