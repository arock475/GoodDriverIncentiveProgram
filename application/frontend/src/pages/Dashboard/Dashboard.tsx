import React, {useEffect, useState } from 'react'
import {
    MDBRow,
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
import LogsCard from '../../components/DashboardCards/LogsCard';
import { getUserClaims } from '../../utils/getUserClaims';

enum User {
    Driver = 0,
    Sponsor = 1,
    Admin = 2,
    Invalid = -1
}

export type DashboardProps = {
    colorTheme?: string,
    viewAs?: number
    setViewAs?: React.Dispatch<React.SetStateAction<number>>
}

const Dashboard: React.FC<DashboardProps> = ({
    colorTheme="dark", viewAs, setViewAs
    }) =>{
    const [userClaims, setUserClaims] = useState(getUserClaims());

    useEffect(() => {
        console.log(`View As updated: ${viewAs}`)
      }, [viewAs])

    return (
        <section className='bg-light'>
            <MDBRow className='h-50'>
                {
                    ((userClaims.role === User.Driver && viewAs === User.Driver) || viewAs === User.Driver) && 
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
                    ((userClaims.role === User.Sponsor && viewAs === User.Sponsor) || viewAs === User.Sponsor) && 
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
                    ((userClaims.role === User.Admin && viewAs === User.Admin) || viewAs === User.Admin) && 
                    <div>
                        <MDBCardGroup>
                            <CatalogCard {...userClaims} />
                            <PointsHistoryCard {...userClaims} />
                            <NotificationsCard {...userClaims} />
                            <OrdersCard {...userClaims} />
                        </MDBCardGroup>
                        <MDBCardGroup className='d-flex justify-content-center'>
                            <ProfileCard {...userClaims} />
                            <OrganizationsCard {...userClaims} />
                            <ReportsCard {...userClaims} />
                            <LogsCard {...userClaims} />
                        </MDBCardGroup>
                    </div>
                }
            </MDBRow> 
        </section>
    )
}
export default Dashboard;