import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { useLocation } from "react-router-dom";

import '../styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Layout from './Layout';
import CreateAccount from './Login/CreateAccount';
import Login from '../pages/Login/Login';
import Profile from '../pages/Profile/Profile';
import EditProfile from '../pages/Profile/EditProfile';
import UserSearch from '../components/Search/UserSearch';
import Faq from '../pages/FAQ/Faq';
// create user page imports
import CreateDriver from './CreateUsers/CreateDriver'
import CreateOrganization from './CreateUsers/CreateOrganization'
import CreateSponsor from './CreateUsers/CreateSponsor'
import CreateAdmin from './CreateUsers/CreateAdmin'
import DriverDashboard from './Dashboard/DriverDashboard';
import SponsorDashboard from './Dashboard/SponsorDashboard';
import AdminDashboard from './Dashboard/AdminDashboard';
//
import Logout from '../components/Login/Logout';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedInAs, setLoggedInAs] = useState("");
  const [loggedInId, setLoggedInId] = useState(0);
  const [loggedInRole, setLoggedInRole] = useState(0);
  const [cookies, setCookie, removeCookie] = useCookies();
  const location = useLocation();

  useEffect(() => {
    const fetchAuth = async () => {
      fetch("http://localhost:3333/auth/is-auth", {
        method: "GET",
        credentials: "include"
      }).then(async response => {
        // check for error response
        if (!response.ok) {
          setLoggedIn(false);
          setLoggedInAs("");
          setLoggedInId(null);
          setLoggedInRole(null);
          return Promise.reject();
        }
        // Login Successful
        if (!loggedIn) {
          setLoggedInAs(cookies.user);
          setLoggedInId(cookies.id);
          setLoggedInRole(cookies.role);
          setLoggedIn(true);
        }
      })
    }

    fetchAuth().catch(error => {
      console.log("Catch: ", error)
    })
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Layout key={loggedInAs} loggedIn={loggedIn} loginUser={loggedInAs} loginId={loggedInId} />}>
        {/* Home Page */}
        <Route index element={<DriverDashboard />} />
        <Route path="logout" element={<Logout />} />

        {/* Login Pages */}
        <Route path="login">
          <Route index element={<Login />} />
          <Route path="create" element={<CreateAccount />} />
        </Route>

        {/* Profile Links */}
        <Route path="user/:userID">
          <Route index element={<Profile />} />
          <Route path="edit" element={<EditProfile />} />
        </Route>

        {/* Search Links */}
        <Route path="search">
          <Route index element={<UserSearch />} />
        </Route>

        {/* Create Pages*/}
        <Route path="admin">
          <Route path="create-driver" element={<CreateDriver />} />
          <Route path="create-org" element={<CreateOrganization />} />
          <Route path="create-sponsor" element={<CreateSponsor />} />
          <Route path="create-admin" element={<CreateAdmin />} />
        </Route>

        {/* Footer Links */}
        <Route path="faq" element={<Faq />} />

        {/* Error Page Eventually */}
        <Route path="*" element={<></>} />
      </Route>
    </Routes>
  );
}


export default App;
