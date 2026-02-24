import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Register from './pages/Register';
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import NewBooking from './pages/NewBooking';
import History from './pages/History';
import Settings from './pages/Settings';
import ManageWorkers from './pages/ManageWorkers';
import Profile from './pages/Profile';
import Layout from './components/Layout';

function isAuthenticated() {
  return !!localStorage.getItem('token');
}

function getRole(): string {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || '';
  } catch { return ''; }
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
}

function ManagerRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (getRole() !== 'Manager') return <Navigate to="/" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Homepage />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="booking" element={<NewBooking />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="manage-workers" element={<ManagerRoute><ManageWorkers /></ManagerRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}
