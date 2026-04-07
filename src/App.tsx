import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import StudyArea from './pages/StudyArea';
import StudyLounges from './pages/StudyLounges';
import NoteSynthesis from './pages/NoteSynthesis';
import SkillBadges from './pages/SkillBadges';
import StudyQuest from './pages/StudyQuest';
import Tutoring from './pages/Tutoring';
import AttendanceManager from './pages/AttendanceManager';
import Projects from './pages/Projects';
import Schedule from './pages/Schedule';
import Sentiment from './pages/Sentiment';
import UserManagement from './pages/UserManagement';
import GlobalChat from './pages/GlobalChat';
import SettingsPage from './pages/SettingsPage';
import MyGrades from './pages/MyGrades';
import StudentPortal from './pages/StudentPortal';
import SoftSkills from './pages/SoftSkills';
import TaskBreaker from './pages/TaskBreaker';
import BookSwap from './pages/BookSwap';
import MyClasses from './pages/MyClasses';
import CollegeReports from './pages/CollegeReports';
import StudentDatabase from './pages/StudentDatabase';
import LectureQuiz from './pages/LectureQuiz';
import GlobalBroadcasts from './pages/GlobalBroadcasts';
import FacultyDirectory from './pages/FacultyDirectory';
import DatabaseExplorer from './pages/DatabaseExplorer';
import BulkExport from './pages/BulkExport';
import MarkAttendance from './pages/MarkAttendance';
import AssignmentManager from './pages/AssignmentManager';
import { useAuthStore } from './store/useAuthStore';


// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
        />

        {/* Core Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/portal" element={<ProtectedRoute><StudentPortal /></ProtectedRoute>} />
        
        {/* Learning Tools */}
        <Route path="/notes" element={<ProtectedRoute><NoteSynthesis /></ProtectedRoute>} />
        <Route path="/soft-skills" element={<ProtectedRoute><SoftSkills /></ProtectedRoute>} />
        <Route path="/study-area" element={<ProtectedRoute><StudyArea /></ProtectedRoute>} />
        <Route path="/study-lounges" element={<ProtectedRoute><StudyLounges /></ProtectedRoute>} />
        <Route path="/tutoring" element={<ProtectedRoute><Tutoring /></ProtectedRoute>} />
        <Route path="/badges" element={<ProtectedRoute><SkillBadges /></ProtectedRoute>} />
        <Route path="/quest" element={<ProtectedRoute><StudyQuest /></ProtectedRoute>} />
        <Route path="/grades" element={<ProtectedRoute><MyGrades /></ProtectedRoute>} />
        <Route path="/classes" element={<ProtectedRoute><MyClasses /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><LectureQuiz /></ProtectedRoute>} />
        
        {/* Academic Management */}
        <Route path="/attendance" element={<ProtectedRoute><AttendanceManager /></ProtectedRoute>} />
        <Route path="/mark-attendance" element={<ProtectedRoute><MarkAttendance /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute><AssignmentManager /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />

        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        
        {/* Utilities */}
        <Route path="/task-breaker" element={<ProtectedRoute><TaskBreaker /></ProtectedRoute>} />
        <Route path="/book-swap" element={<ProtectedRoute><BookSwap /></ProtectedRoute>} />
        
        {/* Admin / HOD Tools */}
        <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/sentiment" element={<ProtectedRoute><Sentiment /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><GlobalChat /></ProtectedRoute>} />
        <Route path="/broadcasts" element={<ProtectedRoute><GlobalBroadcasts /></ProtectedRoute>} />
        <Route path="/college-reports" element={<ProtectedRoute><CollegeReports /></ProtectedRoute>} />
        <Route path="/student-db" element={<ProtectedRoute><StudentDatabase /></ProtectedRoute>} />
        <Route path="/faculty-dir" element={<ProtectedRoute><FacultyDirectory /></ProtectedRoute>} />
        <Route path="/db-explorer" element={<ProtectedRoute><DatabaseExplorer /></ProtectedRoute>} />
        <Route path="/bulk-export" element={<ProtectedRoute><BulkExport /></ProtectedRoute>} />
        
        {/* Settings */}
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* Redirects */}
        <Route 
          path="/" 
          element={<Landing />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
