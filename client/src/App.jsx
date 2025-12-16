import React from 'react'
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Emailverify from './pages/Emailverify';
import Resetpassword from './pages/Resetpassword';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/email-verify' element={<Emailverify />} />
        <Route path='/reset-password' element={<Resetpassword />} />
      </Routes>
    </div>
  )
}

export default App;