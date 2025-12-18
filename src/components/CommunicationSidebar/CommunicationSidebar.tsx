import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  Badge,
} from '@mui/material';
import { ChevronDown, ChevronUp, MessageSquare, Phone } from 'lucide-react';

interface Person {
  id: string;
  full_name: string;
  department?: string;
  semester?: string;
  isActive?: boolean;
}

interface CommunicationSidebarProps {
  title: string;
  endpoint: string;
  userId: string;
  onMessageClick?: (personId: string, personName: string) => void;
  onScheduleClick?: (personId: string, personName: string) => void;
}

export const CommunicationSidebar: React.FC<CommunicationSidebarProps> = ({
  title,
  endpoint,
  userId,
  onMessageClick,
  onScheduleClick,
}) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  useEffect(() => {
    fetchPeople();
    
    // Set up polling to refresh the list every 3 seconds
    const interval = setInterval(() => {
      fetchPeople();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [userId, endpoint]);

  const fetchPeople = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();
      setPeople(data.mentors || data.students || []);
    } catch (err: any) {
      console.error('Error fetching people:', err);
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#f5f5f5',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {title}
          </Typography>
          <Badge badgeContent={people.length} color="primary" />
        </Box>
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{ p: 0.5 }}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </IconButton>
      </Box>

      {/* Content */}
      <Collapse in={expanded}>
        <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 1 }}>
              {error}
            </Alert>
          ) : people.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                No one assigned yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {people.map((person, idx) => (
                <Box key={person.id}>
                  <ListItem
                    disablePadding
                    sx={{
                      bgcolor: selectedPerson === person.id ? '#f0f0f0' : 'transparent',
                      '&:hover': { bgcolor: '#f9f9f9' },
                    }}
                  >
                    <ListItemButton
                      onClick={() => setSelectedPerson(selectedPerson === person.id ? null : person.id)}
                      sx={{ py: 1 }}
                    >
                      <ListItemAvatar sx={{ minWidth: 40, position: 'relative' }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {person.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </Avatar>
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: person.isActive ? '#4caf50' : '#bdbdbd',
                            border: '1px solid white',
                          }}
                        />
                      </ListItemAvatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {person.full_name}
                        </Typography>
                        <Typography variant="caption" color={person.isActive ? 'success.main' : 'textSecondary'} noWrap>
                          {person.isActive ? 'Active now' : person.department ? person.department : 'Inactive'}
                          {person.department && person.semester && ` - ${person.semester}`}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  </ListItem>

                  {/* Action Buttons - Show when selected */}
                  {selectedPerson === person.id && (
                    <Box
                      sx={{
                        p: 1,
                        bgcolor: '#fafafa',
                        display: 'flex',
                        gap: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => onMessageClick?.(person.id, person.full_name)}
                        sx={{
                          flex: 1,
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'primary.dark' },
                        }}
                      >
                        <MessageSquare size={16} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onScheduleClick?.(person.id, person.full_name)}
                        disabled
                        sx={{
                          flex: 1,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Phone size={16} />
                      </IconButton>
                    </Box>
                  )}

                  {idx < people.length - 1 && <Divider sx={{ my: 0 }} />}
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};
