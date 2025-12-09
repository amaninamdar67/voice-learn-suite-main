import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SystemConfigProvider } from './contexts/SystemConfigContext';
import { theme } from './theme/theme';
import { MainLayout } from './components/Layout/MainLayout';
import { Login } from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Lessons from "./pages/Lessons";
import Quizzes from "./pages/Quizzes";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import Discussions from "./pages/Discussions";
import Videos from "./pages/Videos";
import UserManagement from "./pages/Admin/UserManagement";
import Analytics from "./pages/Admin/Analytics";
import SystemConfig from "./pages/Admin/SystemConfig";
import DomainManagement from "./pages/Admin/DomainManagement";
import LinkAccount from "./pages/Admin/LinkAccount";
import LessonUpload from "./pages/Teacher/LessonUpload";
import QuizCreator from "./pages/Teacher/QuizCreator";
import ChildrenView from "./pages/Parent/ChildrenView";
import MentoringView from "./pages/Mentor/MentoringView";
import MentorMessages from "./pages/Mentor/MentorMessages";

// LMS Teacher Pages
import VideoLessonUpload from "./pages/Teacher/VideoLessonUpload";
import RecordedVideosUpload from "./pages/Teacher/RecordedVideosUpload";
import LiveClassCreator from "./pages/Teacher/LiveClassCreator";
import QuizCreatorNew from "./pages/Teacher/QuizCreatorNew";
import QuizRankingsDashboard from "./pages/Teacher/QuizRankingsDashboard";

// LMS Student Pages
import RecordedVideosView from "./pages/Student/RecordedVideosView";
import VideoLessonsView from "./pages/Student/VideoLessonsView";
import LiveClassesView from "./pages/Student/LiveClassesView";
import QuizzesView from "./pages/Student/QuizzesView";
import QuizRankingsView from "./pages/Student/QuizRankingsView";
import OverallRankings from "./pages/Student/OverallRankings";

// Community Pages
import RecordedClassesCommunity from "./pages/Community/RecordedClassesCommunity";
import CoursesCommunity from "./pages/Community/CoursesCommunity";
import LiveClassesCommunity from "./pages/Community/LiveClassesCommunity";
import QuizzesCommunity from "./pages/Community/QuizzesCommunity";
import AssignmentsCommunity from "./pages/Community/AssignmentsCommunity";

const queryClient = new QueryClient();

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <SystemConfigProvider>
            <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/lessons"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Lessons />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/quizzes"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Quizzes />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Settings />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Projects />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/discussions"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Discussions />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/videos"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Videos />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <UserManagement />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Analytics />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/system-config"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <SystemConfig />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/domains"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <DomainManagement />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/link-account"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <LinkAccount />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/lessons/upload"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <LessonUpload />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/quizzes/create"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <QuizCreator />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/children"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <ChildrenView />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/mentoring"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <MentoringView />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/mentor/messages"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <MentorMessages />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              
              {/* LMS Teacher Routes */}
              <Route
                path="/teacher/video-lessons"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <VideoLessonUpload />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/teacher/recorded-videos"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <RecordedVideosUpload />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/teacher/live-classes"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <LiveClassCreator />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/teacher/quiz-creator"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <QuizCreatorNew />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/teacher/quiz-rankings"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <QuizRankingsDashboard />
                    </MainLayout>
                  </PrivateRoute>
                }
              />

              {/* LMS Student Routes */}
              <Route
                path="/student/recorded-videos"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <RecordedVideosView />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/video-lessons"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <VideoLessonsView />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/live-classes"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <LiveClassesView />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/quizzes"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <QuizzesView />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/quiz-rankings"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <QuizRankingsView />
                    </MainLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/leaderboard"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <OverallRankings />
                    </MainLayout>
                  </PrivateRoute>
                }
              />

              {/* Community Routes */}
              <Route
                path="/community"
                element={<Navigate to="/community/recorded-classes" />}
              />
              <Route
                path="/community/recorded-classes"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <RecordedClassesCommunity />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/community/courses"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <CoursesCommunity />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/community/live-classes"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <LiveClassesCommunity />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/community/quizzes"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <QuizzesCommunity />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/community/assignments"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <AssignmentsCommunity />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </SystemConfigProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
