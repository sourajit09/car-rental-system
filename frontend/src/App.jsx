import { Link } from "react-router-dom";
import './App.css'
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Car from './pages/Car/Car';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import  { Toaster } from 'react-hot-toast';
import CarDetails from "./pages/Car/CarDetails.jsx";
import Profile from "./pages/user/Profile.jsx";
import AdminDashboard from "./pages/Admin/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

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
    
        <Route path='/cars' element={<Car />} />
         <Route path='/cars/:id' element={<CarDetails />} />
          <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path='/dashboard' element={<AdminRoute><AdminDashboard /></AdminRoute>} />
           {/* <Route path='/' element={<Home />} /> */}
      </Routes>
      
      {/* Footer always bottom */}
      <Footer />
    </>
  );
}

export default App;
