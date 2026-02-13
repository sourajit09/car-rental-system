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

function App() {
  return (
    <>
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
      </Routes>

      {/* Footer always bottom */}
      <Footer />
    </>
  );
}

export default App;
