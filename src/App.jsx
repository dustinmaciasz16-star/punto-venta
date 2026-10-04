import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { DashboardLayout } from './pages/DashboardLayout';
import { getCurrentUser } from './service/authService';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const activeUser = getCurrentUser();
    if (activeUser) {
      setUser(activeUser);
    }
  }, []);

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <Login onLoginSuccess={(u) => setUser(u)} /> : <Navigate to="/dashboard" />} 
      />

      <Route 
        path="/dashboard/*" 
        element={user ? <DashboardLayout user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" />} 
      />

      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default App;