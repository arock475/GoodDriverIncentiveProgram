import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import '../styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Layout from './Layout';
import CreateAccount from './Login/CreateAccount';
import Login from '../pages/Login/Login';
import Profile from '../pages/Profile/Profile';
import Faq from '../pages/FAQ/Faq';

const App = () => {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Home Page */}
            <Route index element={<></>} />

            {/* Login Pages */}
            <Route path="login">
              <Route index element={<Login />}/>
              <Route path="create" element={<CreateAccount />}/>
            </Route>

            {/* Profile Links */}
            <Route path="user">
              <Route index element={<Profile />}/>
            </Route>

            {/* Footer Links */}
            <Route path="faq" element={<Faq />} />

            {/* Error Page Eventually */}
            <Route path="*" element={<></>} />
          </Route>
        </Routes>
    </BrowserRouter>
  )
}


export default App;
