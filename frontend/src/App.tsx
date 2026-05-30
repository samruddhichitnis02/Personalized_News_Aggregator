import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Feed from './pages/Feed';
import Bookmarks from './pages/Bookmarks';

// protects routes that require login
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, loading } = useAuth();
  if (loading) return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      height: '100vh', color: 'var(--accent)', fontFamily: 'var(--font-display)',
      fontSize: '1.5rem', letterSpacing: '0.05em'
    }}>
      Loading...
    </div>
  );
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/feed" />} />
      <Route path="/register" element={!token ? <Register /> : <Navigate to="/feed" />} />
      <Route path="/onboarding" element={
        <ProtectedRoute><Onboarding /></ProtectedRoute>
      } />
      <Route path="/feed" element={
        <ProtectedRoute><Feed /></ProtectedRoute>
      } />
      <Route path="/bookmarks" element={
        <ProtectedRoute><Bookmarks /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to={token ? "/feed" : "/login"} />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;