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

import Logout from '../components/Login/Logout';

import DriverApplications from './DriverApplications/DriverApplications';
import Points from './Points/Points'
import ResetPassword from './Profile/ResetPassword';
import PointManagment from './Points/PointManagment';
import CreateCategory from './Points/CreateCategory'; import AddPoints from './Points/AddPoints';
import ShopCatalog from './Shop/ShopCatalog'

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
          <Route path="reset" element={<ResetPassword />} />

        </Route>

        {/* Catalog Link */}
        <Route path="catalog">
          <Route index element={<ShopCatalog />} />
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

        {/* Point History */}
        <Route path="points" element={<Points loggedIn={loggedIn} loginRole={loggedInRole} />} />

        {/* Point Pages */}
        <Route path="points-change">
          <Route index element={<PointManagment />} />
          <Route path="create" element={<CreateCategory />} />
          <Route path="add" element={<AddPoints />} />
        </Route>

        {/* Application Links */}
        <Route path="applications">
          <Route index element={<DriverApplications />} />
        </Route>

        {/* Footer Links */}
        <Route path="faq" element={<Faq />} />

        {/* Error Page Eventually */}
        <Route path="*" element={<></>} />

        {/* Logs Link */}
        <Route path="logs" element={<></>} />

        {/* Reports Link */}
        <Route path="reports" element={<></>} />

        {/* Notifications Link */}
        <Route path="notifications" element={<></>} />

        {/* Orders Link */}
        <Route path="orders" element={<></>} />

        {/* Points History Link */}
        <Route path="points-change" element={<></>} />

        {/* Applications Links */}
        <Route path="applications">
          <Route path="driver" element={<></>} />
          <Route path="sponsor" element={<></>} />
          <Route path="admin" element={<></>} />
        </Route>

      </Route>
    </Routes>
  );
}


export default App;
