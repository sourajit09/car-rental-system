import './App.css'
import { Navigate, Routes, Route } from 'react-router-dom';
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
import  { Toaster } from 'react-hot-toast';
import CarDetails from "./pages/Car/CarDetails.jsx";
import Profile from "./pages/user/Profile.jsx";
import OwnerDashboard from "./pages/Owner/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import OwnerRoute from "./components/OwnerRoute.jsx";

function App() {
  return (
    <>
    <Toaster/>
      {/* Navbar always on top */}
      <Header />

      {/* Pages change here */}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
 
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
         {/* <Route path="/register" element={<Register />} /> */}
    
        <Route path='/cars' element={<ProtectedRoute><Car /></ProtectedRoute>} />
         <Route path='/cars/:id' element={<ProtectedRoute><CarDetails /></ProtectedRoute>} />
          <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path='/owner/dashboard' element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
          <Route path='/dashboard' element={<Navigate to='/owner/dashboard' replace />} />
           {/* <Route path='/' element={<Home />} /> */}
      </Routes>
      
      {/* Footer always bottom */}
      <Footer />
    </>
  );
}

export default App;
