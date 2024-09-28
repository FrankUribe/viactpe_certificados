import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Certificados from "./pages/Certificados.jsx";
import Consulta from "./pages/Consulta.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/Notfound.jsx";

import '../src/assets/styles.css';

function App() {
  return (
    <BrowserRouter basename="/certificados">
        <Routes>
          <Route exact path='/' element={<Consulta/>} />
          <Route exact path='/consulta' element={<Consulta/>}/>
          <Route exact path='/admin' element={<Certificados/>}/>
          <Route exact path='/login' element={<Login/>}/>
          <Route path="*" element={<NotFound/>} />
        </Routes>
    </BrowserRouter>
  )
}

export default App