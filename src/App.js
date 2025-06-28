import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';

import { AuthContext, AuthProvider } from './context/AuthContext';

import HomeScreen from './screens/ForTeacher';
import LandingPage from './screens/HomePage';
import Navbar from './components/Navbar';
import QuizGenerator from './screens/QuizGenerator';
import ChapterSummarizer from './screens/summarizer';
import TeachingAssistant from './screens/AssistantScreen';
import StudentQuizInterface from './screens/StudentQuizInterface';
import AssignmentView from './screens/Assignmentview';
import AssignmentResults from './screens/AssignmentResults';
import CreateAssignmentForm from './screens/CreateAssignmentForm';
import AssignmentPreview from './screens/AssignmentPreview';
import AssignmentReview from './screens/AssignmentReview';
import ReviewSubmission from './screens/ReviewSubmission';
import TeacherSignup from './screens/auth/TeacherSignup';
import TeacherLogin from './screens/auth/TeacherLogin';
import StudentChatbot from './screens/StudentChatbot';
import AboutUs from './screens/AboutUs';

// 🧠 Subcomponent to use AuthContext safely
function AppRoutes() {
  const { isAuthenticated, user } = React.useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/teachers"
        element={
          isAuthenticated && user?.role === 'teacher' ? (
            <HomeScreen />
          ) : (
            <Navigate to="/teacher/login" replace />
          )
        }
      />
      <Route path="/assistant" element={<TeachingAssistant />} />
      <Route path="/quiz" element={<QuizGenerator />} />
      <Route path="/assignments/generate" element={<CreateAssignmentForm />} />
      <Route path="/assignments/publish/:assignmentId" element={<AssignmentPreview />} />
      <Route path="/summarize" element={<ChapterSummarizer />} />
      <Route path="/student/quiz/:sessionId" element={<StudentQuizInterface />} />
      <Route path="/student/assignment/:sessionId" element={<AssignmentView />} />
      <Route path="/student/assignment/results/:sessionId" element={<AssignmentResults />} />
      <Route path="/student/assignment/review/:sessionId" element={<AssignmentReview />} />
      <Route
        path="/teacher/submission/:submissionId"
        element={
          isAuthenticated ? <ReviewSubmission /> : <Navigate to="/teacher/login" replace />
        }
      />
      <Route path="/teacher/signup" element={<TeacherSignup />} />
      <Route path="/teacher/login" element={<TeacherLogin />} />
      <Route path="/student/chatbot/:chapterId" element={<StudentChatbot />} />
      <Route path="/about" element={<AboutUs />} />
    </Routes>
  );
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Figtree', sans-serif",
        },
      }}
    >
      <AuthProvider>
        <Router>
          <Navbar />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
