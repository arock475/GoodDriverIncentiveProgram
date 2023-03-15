import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap';
import jwt_decode from 'jwt-decode'
import { useCookies } from 'react-cookie';

export type jwtClaim = {
    authorized: boolean,
    email: string,
    role: number
}

interface Organization {
    ID: number
    Name: string
    Bio: string
    Phone: string
    Email: string
    LogoURL: string
}

interface Driver {
    ID: number,
    UserID: number,
    Status: number,
    LicencePlate: string,
    TruckType: string,
}

interface PointsTotals {
    Total: number,
    Organization: Organization
    Driver: Driver
}

const PointsTable = ({}) => {  

    // user role and cookies variables
    const [userRole, setUserRole] = useState(null);
    const [cookies, setCookie, removeCookie] = useCookies();
    const [points, setPoints,] = useState<PointsTotals[]>([]);

    // On load, set claim using cookies, get user role from it, then use user role to fetch from backend
    useEffect(() => {
        const token = cookies.jwt;
        if (token) {
            const claim: jwtClaim = jwt_decode(token);
            setUserRole(claim.role);
        }
        // making call to api
        // console.log(`Component/PointsTable: TESTING: cookies.id = ${cookies.id}`);
        const fetchPoints = async () => {
            const response = await fetch(`http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/points/${1}/totals`); // DEBUG: Temp code
            const data = await response.json();
            setPoints(data);
        };
        fetchPoints();
    }, [])

    // Returning conditionally rendered table based on role
    switch (userRole) {
        case 0: // driver
            try {
                return (
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Organization Name</th>
                            <th>Points</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            points.map((pointsTotal) => (
                                <tr key={pointsTotal.Organization.ID}>
                                    <td>{pointsTotal.Organization.ID}</td>
                                    <td>{pointsTotal.Organization.Name}</td>
                                    <td>{pointsTotal.Total}</td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </Table>
                );
            }
            catch (error) {
                return (
                    <div> Error loading Points Table </div>
                );
            }
    case 1: // sponsor
        // implement later
        break;
    case 2: // admin
        // implement later
        break;
    default: // loggedIn w/o role -> error from depreciated user
        // console.log("PointsTable component: depreciated user attempting to access points!");
        break;
}
}

export default PointsTable;