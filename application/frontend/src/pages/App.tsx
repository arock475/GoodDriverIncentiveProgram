import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import '../styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Layout from './Layout';
import CreateAccount from './Login/CreateAccount';
import Login from '../pages/Login/Login';
import Faq from '../pages/FAQ/Faq';


const LoginGroup: React.FC<{}> = () => {
  return (
    <Routes>
      <Route path="/" element={<></>}>
        <Route index element={<Login />}/>
        <Route path="create" element={<CreateAccount />}/>
      </Route>
    </Routes>
  )
}


const App = () => {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<></>} />
            <Route path="login" element={<LoginGroup />}/>

            <Route path="faq" element={<Faq />} />
            <Route path="*" element={<></>} />
          </Route>
        </Routes>
    </BrowserRouter>
  )
}


export default App;
