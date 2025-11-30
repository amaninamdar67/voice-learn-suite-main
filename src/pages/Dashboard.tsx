import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './Admin/AdminDashboard';
import TeacherDashboard from './Teacher/TeacherDashboard';
import StudentDashboard from './Student/StudentDashboard';
import ParentDashboard from './Parent/ParentDashboard';
import MentorDashboard from './Mentor/MentorDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'parent':
      return <ParentDashboard />;
    case 'mentor':
      return <MentorDashboard />;
    default:
      return <StudentDashboard />;
  }
};

export default Dashboard;
