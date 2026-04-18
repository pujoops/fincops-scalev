import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthScreen from './pages/AuthScreen';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Checkout from './pages/Checkout';
import LandingBuilder from './pages/LandingBuilder';
import LandingPage from './pages/LandingPage';
import LMS from './pages/LMS';
import Affiliate from './pages/Affiliate';
import Orders from './pages/Orders';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Withdrawal from './pages/Withdrawal';
import Email from './pages/Email';
// import ComingSoon from './pages/ComingSoon';
import { AuthProvider } from './lib/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } />
          <Route path="/landing" element={
            <ProtectedRoute>
              <LandingBuilder />
            </ProtectedRoute>
          } />
          <Route path="/lms" element={
            <ProtectedRoute>
              <LMS />
            </ProtectedRoute>
          } />
          <Route path="/affiliate" element={
            <ProtectedRoute>
              <Affiliate />
            </ProtectedRoute>
          } />
          
          {/* PHASE 8: NEW MENUS */}
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/email" element={<ProtectedRoute><Email /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/withdrawal" element={<ProtectedRoute><Withdrawal /></ProtectedRoute>} />
          
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/p/:id" element={<LandingPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
