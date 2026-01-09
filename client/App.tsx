import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TransactionProvider } from './context/TransactionContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import TransactionDetail from './pages/TransactionDetail';
import Simulation from './pages/Simulation';
import EntityView from './pages/EntityView';
import PageA from './pages/banka';
import PageB from './pages/bankb';

// Fix: Explicitly typing ProtectedRoute as React.FC with children to ensure JSX recognition of nested elements as props
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <TransactionProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/alerts" 
            element={
              <ProtectedRoute>
                <Alerts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/entities" 
            element={
              <ProtectedRoute>
                <EntityView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/simulation" 
            element={
              <ProtectedRoute>
                <Simulation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transaction/:id" 
            element={
              <ProtectedRoute>
                <TransactionDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/page-a" 
            element={
              <ProtectedRoute>
                <PageA />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/page-b" 
            element={
              <ProtectedRoute>
                <PageB />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </HashRouter>
    </TransactionProvider>
  );
};

export default App;