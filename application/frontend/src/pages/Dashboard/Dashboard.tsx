import React, {useEffect, useState } from 'react'
import Container from 'react-bootstrap/Container';
import Link from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useCookies } from 'react-cookie'
import jwt_decode from 'jwt-decode'
import {
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBCardImage,
    MDBRow,
    MDBCol,
    MDBCardGroup
  } from 'mdb-react-ui-kit';
import ApplicationsCard from '../../components/DashboardCards/ApplicationsCard';
import CatalogCard from '../../components/DashboardCards/CatalogCard';
import NotificationsCard from '../../components/DashboardCards/NotificationsCard';
import OrdersCard from '../../components/DashboardCards/OrdersCard';
import OrganizationsCard from '../../components/DashboardCards/OrganizationsCard';
import PointsHistoryCard from '../../components/DashboardCards/PointsHistoryCard';
import ProfileCard from '../../components/DashboardCards/ProfileCard';
import ReportsCard from '../../components/DashboardCards/ReportsCard';
import Points from '../Points/Points';
import { getUserClaims } from '../../utils/getUserClaims';

enum User {
    Driver = 0,
    Sponsor = 1,
    Admin = 2,
    Invalid = -1
}

const Dashboard = () =>{
    const [userClaims, setUserClaims] = useState(getUserClaims());

    return (
        <section className='bg-light'>
            <MDBRow className='h-50'>
                {
                    userClaims.role == User.Driver && 
                    <div>
                        <MDBCardGroup>
                            <CatalogCard {...userClaims} />
                            <PointsHistoryCard {...userClaims} />
                            <NotificationsCard {...userClaims} />
                            <OrdersCard {...userClaims} />
                        </MDBCardGroup>
                        <MDBCardGroup className='d-flex justify-content-center'>
                            <ApplicationsCard {...userClaims} />
                            <ProfileCard {...userClaims} />
                            <OrganizationsCard {...userClaims} />
                        </MDBCardGroup>
                    </div>
                }
                {
                    userClaims.role == User.Sponsor && 
                    <div>
                        <MDBCardGroup>
                            <CatalogCard {...userClaims} />
                            <PointsHistoryCard {...userClaims} />
                            <NotificationsCard {...userClaims} />
                            <OrdersCard {...userClaims} />
                        </MDBCardGroup>
                        <MDBCardGroup className='d-flex justify-content-center'>
                            <ApplicationsCard {...userClaims} />
                            <ProfileCard {...userClaims} />
                            <OrganizationsCard {...userClaims} />
                            <ReportsCard {...userClaims} />
                        </MDBCardGroup>
                    </div>
                }
                {
                    userClaims.role == User.Admin && 
                    <div>
                        <MDBCardGroup>
                            <CatalogCard {...userClaims} />
                            <PointsHistoryCard {...userClaims} />
                            <NotificationsCard {...userClaims} />
                            <OrdersCard {...userClaims} />
                        </MDBCardGroup>
                        <MDBCardGroup className='d-flex justify-content-center'>
                            <ApplicationsCard {...userClaims} />
                            <ProfileCard {...userClaims} />
                            <OrganizationsCard {...userClaims} />
                            <ReportsCard {...userClaims} />
                        </MDBCardGroup>
                    </div>
                }
            </MDBRow> 
        </section>
    )
}
export default Dashboard;