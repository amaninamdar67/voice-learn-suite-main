import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AssignmentsView from './Student/AssignmentsView';
import AssignmentCreator from './Teacher/AssignmentCreator';

const Projects: React.FC = () => {
  const { user } = useAuth();

  // Route to appropriate assignment page based on role
  if (user?.role === 'teacher') {
    return <AssignmentCreator />;
  }

  // Default to student view for students, mentors, and parents
  return <AssignmentsView />;
};

export default Projects;
