import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from 'next-themes';
import Layout from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Import pages
import Index from './pages/Index';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import CafeSettings from './pages/CafeSettings';
import NotFound from './pages/NotFound';

// Import auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <SocketProvider>
            <CartProvider>
              <Router>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Index />} />
                    <Route path="home" element={<HomePage />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="auth/login" element={<LoginPage />} />
                    <Route path="auth/register" element={<RegisterPage />} />
                    
                    {/* Menu routes (public for QR code access) */}
                    <Route path="menu/:cafeId" element={<Menu />} />
                    
                    {/* Protected routes */}
                    <Route path="dashboard" element={
                      <ProtectedRoute allowedRoles={['super_admin', 'admin', 'cafeowner', 'cafe_owner']}>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="settings" element={
                      <ProtectedRoute allowedRoles={['cafeowner', 'cafe_owner']}>
                        <CafeSettings />
                      </ProtectedRoute>
                    } />
                    
                    {/* Catch all route */}
                    <Route path="404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Route>
                </Routes>
              </Router>
            </CartProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;