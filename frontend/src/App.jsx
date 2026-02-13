import './App.css'
import { Routes,Route } from 'react-router';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Car from './pages/Car/Car';    

function App() {
return (
  <>
<Routes>
  <Route path='/' element={<Home/>}/>
  <Route path='/about' element={<About/>}/>
  <Route path='/contact' element={<Contact/>}/>
  <Route path='/login' element={<Login/>}/>
  <Route path='/register' element={<Register/>}/>
  <Route path='/cars' element={<Car/>}/>

  </Routes>

  </>
 ); }
export default App
