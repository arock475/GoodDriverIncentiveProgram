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

import CreateOrganization from './Organizations/CreateOrganization'
import DriverDashboard from './Dashboard/DriverDashboard';
import SponsorDashboard from './Dashboard/SponsorDashboard';
import AdminDashboard from './Dashboard/AdminDashboard';

import Logout from '../components/Login/Logout';
import Applications from './DriverApplications/Applications';
import Points from './Points/Points'
import ResetPassword from './Profile/ResetPassword';
import PointManagment from './Points/PointManagment';
import CreateCategory from './Points/CreateCategory'; import AddPoints from './Points/AddPoints';
import ShopCatalog from './Shop/ShopCatalog'
import CreateUser from '../components/CreateUser/CreateUser';
import Dashboard from './Dashboard/Dashboard';
import Organization from './Organizations/Organization';
import Organizations from './Organizations/Organizations';
import ChangePointStats from './Profile/ChangePointStats';
import LogsPage from './Admin/Logs';
import ShopManage from './Shop/ShopManage';
import PointsReport from './Reports/PointsReport';
import SponsorSales from './Reports/SponsorSales';
import ShopCheckout from './Shop/ShopCheckout';
import SalesByDriverReport from './Reports/SalesByDriverReport';
import OrderHistory from './Shop/OrderHistory';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedInRole, setLoggedInRole] = useState(0);
  const [cookies, setCookie, removeCookie] = useCookies();
  const [viewAs, setViewAs] = useState(-1);

  return (
    <Routes>
      <Route path="/" element={<Layout colorTheme="" viewAs={viewAs} setViewAs={setViewAs} />}>
        {/* Home Page */}
        <Route index element={<Dashboard viewAs={viewAs} setViewAs={setViewAs} />} />
        <Route path="logout" element={<Logout />} />

        {/* Login Pages */}
        <Route path="login">
          <Route index element={<Login />} />
          <Route path="create" element={<CreateUser />} />
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
          <Route path="manage" element={<ShopManage />} />
          <Route path="checkout" element={<ShopCheckout />} />
        </Route>

        {/* Search Links */}
        <Route path="search">
          <Route index element={<UserSearch />} />
        </Route>

        {/* Create Pages*/}
        <Route path="create-user" element={<CreateUser viewAs={viewAs} setViewAs={setViewAs} />} />
        <Route path="create-org" element={<CreateOrganization />} />
        <Route path="points" element={<Points loggedIn={loggedIn} loginRole={loggedInRole} />} />

        {/* Point Pages */}
        <Route path="points-change">
          <Route index element={<PointManagment />} />
          <Route path="create" element={<CreateCategory />} />
          <Route path="add" element={<AddPoints />} />
          <Route path="stats" element={<ChangePointStats />} />
        </Route>

        {/* Application Links */}
        <Route path="applications/*">
          <Route index element={<Applications />} />
        </Route>

        {/* Footer Links */}
        <Route path="faq" element={<Faq />} />

        {/* Error Page Eventually */}
        <Route path="*" element={<></>} />

        {/* Logs Link */}
        <Route path="logs" element={<LogsPage />} />

        {/* Reports Link */}
        <Route path="reports" >
          <Route path="points" element={<PointsReport />} />
          <Route path="sales-by-driver" element={<SalesByDriverReport />} />
          <Route path="sponsor/sales" element={<SponsorSales />} />
        </Route>

        {/* Notifications Link */}
        <Route path="notifications" element={<></>} />

        {/* Orders Link */}
        <Route path="orders" element={<OrderHistory />} />

        {/* Applications Links */}
        <Route path="applications">
          <Route path="driver" element={<></>} />
          <Route path="sponsor" element={<></>} />
          <Route path="admin" element={<></>} />
        </Route>

        <Route path="orgs" element={<Organizations />} />
        <Route path="orgs/:orgid" element={<Organization />} />
      </Route>
    </Routes>
  );
}


export default App;
