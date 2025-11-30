import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow,
  Add,
  Fullscreen,
  VolumeUp,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useVoiceContent } from '../hooks/useVoiceContent';

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  duration: string;
  uploadedBy: string;
  uploadDate: string;
  views: number;
  attended: boolean;
}

const Videos: React.FC = () => {
  const { user } = useAuth();
  const [openAddVideo, setOpenAddVideo] = useState(false);
  const [openPlayer, setOpenPlayer] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [watchProgress, setWatchProgress] = useState(0);

  const videos: Video[] = [
    {
      id: '1',
      title: 'React Hooks Deep Dive',
      description: 'Complete guide to useState, useEffect, and custom hooks',
      youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '45:30',
      uploadedBy: 'Prof. Smith',
      uploadDate: '2024-01-10',
      views: 234,
      attended: true,
    },
    {
      id: '2',
      title: 'TypeScript Advanced Types',
      description: 'Learn about generics, utility types, and type guards',
      youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '38:15',
      uploadedBy: 'Prof. Johnson',
      uploadDate: '2024-01-12',
      views: 189,
      attended: false,
    },
    {
      id: '3',
      title: 'CSS Grid & Flexbox Masterclass',
      description: 'Modern layout techniques for responsive design',
      youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '52:00',
      uploadedBy: 'Prof. Davis',
      uploadDate: '2024-01-14',
      views: 312,
      attended: false,
    },
  ];

  const handleAddVideo = () => {
    if (youtubeLink && videoTitle) {
      // Handle video addition
      setOpenAddVideo(false);
      setYoutubeLink('');
      setVideoTitle('');
      setVideoDescription('');
    }
  };

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    setOpenPlayer(true);
    setWatchProgress(0);
    
    // Simulate video progress for attendance
    const interval = setInterval(() => {
      setWatchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 3000);
  };

  const handleVideoSelect = (index: number) => {
    const video = videos[index];
    if (video) {
      handlePlayVideo(video);
    }
  };

  // Enable voice content reading
  useVoiceContent(
    videos.map((video, idx) => ({ title: video.title, index: idx })),
    handleVideoSelect
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            {user?.role === 'teacher' ? 'Video Library' : 'Learning Videos'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.role === 'teacher' 
              ? 'Upload and manage video content'
              : 'Watch recorded lessons and live sessions'}
          </Typography>
        </Box>
        {user?.role === 'teacher' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenAddVideo(true)}
          >
            Add Video
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {videos.map((video) => (
          <Card
            key={video.id}
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
            onClick={() => handlePlayVideo(video)}
          >
            <Box
              sx={{
                position: 'relative',
                paddingTop: '56.25%',
                bgcolor: 'grey.900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.5)',
                }}
              >
                <IconButton
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    width: 64,
                    height: 64,
                  }}
                >
                  <PlayArrow sx={{ fontSize: 40 }} />
                </IconButton>
              </Box>
              <Chip
                label={video.duration}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.8)',
                  color: 'white',
                }}
              />
              {video.attended && (
                <Chip
                  icon={<CheckCircle />}
                  label="Attended"
                  size="small"
                  color="success"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  }}
                />
              )}
            </Box>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {video.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                {video.description}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {video.uploadedBy}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {video.views} views
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Add Video Dialog */}
      <Dialog open={openAddVideo} onClose={() => setOpenAddVideo(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Video</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Video Title"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />
            <TextField
              fullWidth
              label="YouTube Link"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              helperText="Paste the YouTube video URL"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
            />
            <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
              <Typography variant="caption">
                💡 Tip: Students' attendance will be automatically tracked when they watch the video
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddVideo(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddVideo}
            disabled={!youtubeLink || !videoTitle}
          >
            Add Video
          </Button>
        </DialogActions>
      </Dialog>

      {/* Video Player Dialog */}
      <Dialog
        open={openPlayer}
        onClose={() => setOpenPlayer(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{selectedVideo?.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {watchProgress >= 80 ? (
                <Chip
                  icon={<CheckCircle />}
                  label="Attendance Marked"
                  color="success"
                  size="small"
                />
              ) : (
                <Chip
                  icon={<Schedule />}
                  label={`${watchProgress}% watched`}
                  color="primary"
                  size="small"
                />
              )}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black', mb: 2 }}>
            <iframe
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
              src={selectedVideo?.youtubeUrl}
              title={selectedVideo?.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Attendance Progress
            </Typography>
            <LinearProgress
              variant="determinate"
              value={watchProgress}
              sx={{ height: 8, borderRadius: 4 }}
              color={watchProgress >= 80 ? 'success' : 'primary'}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Watch at least 80% to mark attendance
            </Typography>
          </Box>

          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              About this video
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedVideo?.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Uploaded by: {selectedVideo?.uploadedBy}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Duration: {selectedVideo?.duration}
              </Typography>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button variant="outlined" startIcon={<Fullscreen />} fullWidth>
              Fullscreen
            </Button>
            <Button variant="outlined" startIcon={<VolumeUp />} fullWidth>
              Audio Settings
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPlayer(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Videos;
