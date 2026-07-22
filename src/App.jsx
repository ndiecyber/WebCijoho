import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import SuccessModal from './components/SuccessModal';
import ScrollToTop from './components/ScrollToTop';

// Import Pages
import Home from './pages/Home';
import WahanaPage from './pages/WahanaPage';
import GaleriPage from './pages/GaleriPage';
import BeritaPage from './pages/BeritaPage';
import FasilitasPage from './pages/FasilitasPage';
import TentangKamiPage from './pages/TentangKamiPage';
import KontakPage from './pages/KontakPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import VisitorDashboard from './pages/VisitorDashboard';
import MobileAppView from './components/MobileAppView';

// Route Guard Component for Staff
function ProtectedRoute({ children, allowedRoles }) {
  const session = JSON.parse(localStorage.getItem('staffSession'));
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    if (session.role === 'kasir') {
      return <Navigate to="/kasir" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function AppContent() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState('reguler');
  const [bookingDetails, setBookingDetails] = useState(null);
  const location = useLocation();

  React.useEffect(() => {
    // Fix invalid HashRouter URLs like /login#/ or /login
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      const cleanPath = window.location.pathname.replace(/^\//, '');
      const search = window.location.search || '?role=staf';
      window.location.href = window.location.origin + '/#/' + cleanPath + search;
    }
  }, [location]);

  const handleOpenBooking = (ticketType = 'reguler') => {
    setSelectedTicket(ticketType);
    navigate('/pesan-tiket');
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  const handleSubmitBooking = (orderDetails) => {
    console.log('React Order Submitted:', orderDetails);
    const bookingCode = 'WCI-' + Math.floor(100000 + Math.random() * 900000);
    setBookingDetails({ ...orderDetails, bookingCode });
    setIsBookingOpen(false);
    
    // Smooth transition to success modal
    setTimeout(() => {
      setIsSuccessOpen(true);
    }, 300);
  };

  const handleCloseSuccess = () => {
    setIsSuccessOpen(false);
  };

  const isFullLayoutRoute = ['/kasir', '/login', '/admin', '/dashboard', '/pengunjung'].includes(location.pathname);

  return (
    <>
      <ScrollToTop />
      {!isFullLayoutRoute && <Header onOpenBooking={handleOpenBooking} />}
      
      <main className={isFullLayoutRoute ? 'full-dashboard-main-layout' : ''}>
        <Routes>
          <Route path="/" element={<Home onOpenBooking={handleOpenBooking} />} />
          <Route path="/wahana" element={<WahanaPage />} />
          <Route path="/galeri" element={<GaleriPage />} />
          <Route path="/berita" element={<BeritaPage />} />
          <Route path="/fasilitas" element={<FasilitasPage />} />
          <Route path="/tentang-kami" element={<TentangKamiPage />} />
          <Route path="/kontak" element={<KontakPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pesan-tiket" element={<VisitorDashboard />} />
          <Route path="/dashboard" element={<VisitorDashboard />} />
          <Route path="/pengunjung" element={<VisitorDashboard />} />
          <Route 
            path="/kasir" 
            element={
              <ProtectedRoute allowedRoles={['kasir', 'admin']}>
                <MobileAppView isCashierMode={true} onOpenBooking={handleOpenBooking} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>

      {!isFullLayoutRoute && <Footer onOpenBooking={handleOpenBooking} />}

      {/* Success Confirmation Overlay */}
      <SuccessModal 
        isOpen={isSuccessOpen} 
        onClose={handleCloseSuccess} 
        details={bookingDetails}
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
