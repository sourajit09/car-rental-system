import './App.css'
import { Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword.jsx';
import ResetPassword from './pages/Auth/ResetPassword.jsx';
import Car from './pages/Car/Car';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import { Toaster } from 'react-hot-toast';
import CarDetails from "./pages/Car/CarDetails.jsx";
import Profile from "./pages/user/Profile.jsx";
import OwnerDashboard from "./pages/Owner/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import OwnerRoute from "./components/OwnerRoute.jsx";

// Admin Imports
import AdminLogin from "./pages/Admin/AdminLogin.jsx";
import AdminRegister from "./pages/Admin/AdminRegister.jsx";
import AdminDashboard from "./pages/Admin/Dashboard.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import "./pages/Admin/AdminStyles.css";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  isAdminUser,
} from "./utils/authStorage.js";

const AdminShell = ({ children }) => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearAuthSession();
    navigate("/admin/login");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg fixed-top admin-navbar">
        <div className="container-fluid">
          <span className="navbar-brand d-flex align-items-center gap-2">
            <span className="brand-pill">ADMIN</span>
            <span>Car Rental Control</span>
          </span>
          <div className="ms-auto d-flex align-items-center gap-3">
            {user?.email && <span className="small text-muted">{user.email}</span>}
            <button className="btn btn-dark btn-sm rounded-pill px-3" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="admin-content-wrapper">
        {children}
      </div>
    </>
  );
};

const AdminOnlyDashboard = () => (
  <AdminRoute>
    <AdminShell>
      <AdminDashboard />
    </AdminShell>
  </AdminRoute>
);

const AdminRootRedirect = () => {
  const token = getStoredToken();
  const user = getStoredUser();

  return token && isAdminUser(user) ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/admin/login" replace />
  );
};

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <Toaster />
      {/* Navbar always on top, hidden on admin routes */}
      {!isAdminRoute && <Header />}

      {/* Pages change here */}
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRootRedirect />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={<AdminOnlyDashboard />} />
        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

        {/* Client/User Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
 
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
    
        <Route path='/cars' element={<ProtectedRoute><Car /></ProtectedRoute>} />
        <Route path='/cars/:id' element={<ProtectedRoute><CarDetails /></ProtectedRoute>} />
        <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path='/owner/dashboard' element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
        <Route path='/dashboard' element={<Navigate to='/owner/dashboard' replace />} />
      </Routes>
      
      {/* Footer always bottom, hidden on admin routes */}
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;

