import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap';
import jwt_decode from 'jwt-decode'
import { useCookies } from 'react-cookie';

export type jwtClaim = {
    authorized: boolean,
    email: string,
    role: number
}
// lower case because of weird bug. My guess is a weird preloading thing on API
export type user = {
    id: number,
    email: string,
    firstName: string,
    lastName: string,
    phone: string,
    bio: string,
    imageURL: string,
    type: string
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
    User: user,
    Status: number,
    LicencePlate: string,
    TruckType: string,
    // Organizations: Organizations[]
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
            const response = await fetch(`http://localhost:3333/points/${cookies.id}/totals`); // DEBUG: Temp code
            const data = await response.json();
            setPoints(data);
        };
        fetchPoints();
    }, [])

    // Returning conditionally rendered table based on role
    switch (userRole) {
        case 0: // driver
            return (
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>Org. ID</th>
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
    case 1: // sponsor
        try {     
            return (
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>Driver ID</th>
                        <th>Driver name</th>
                        <th>Points</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                            points.map((pointsTotal) => (
                                <tr key={pointsTotal.Driver.ID}>
                                    <td>{pointsTotal.Driver.ID}</td>
                                    <td>{`${pointsTotal.Driver.User.firstName} ${pointsTotal.Driver.User.lastName}`}</td>
                                    <td>{pointsTotal.Total}</td>
                                </tr>
                            ))                    
                    }
                    </tbody>
                </Table>
            );
        } catch (error) {
            return (
                <div>
                    Component PointsTable: Error loading table
                </div>
            );
        }
    case 2: // admin
        // implement later
        break;
    default: // loggedIn w/o role -> error from depreciated user
        // console.log("PointsTable component: depreciated user attempting to access points!");
        break;
}
}

export default PointsTable;