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
import LessonUpload from "./pages/Teacher/LessonUpload";
import QuizCreator from "./pages/Teacher/QuizCreator";
import ChildrenView from "./pages/Parent/ChildrenView";
import MentoringView from "./pages/Mentor/MentoringView";

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
