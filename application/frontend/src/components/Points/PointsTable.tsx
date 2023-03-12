import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap';
import jwt_decode from 'jwt-decode'
import { useCookies } from 'react-cookie';

export type jwtClaim = {
    authorized: boolean,
    email: string,
    role: number
}

interface PointsTable {
    id: number
    driverID: number,
    organizationID: number,
    numChange: number,
    reason: string,
    total: number,
    // createdAt: time
}

const PointsTable = ({}) => {  

    // user role and cookies variables
    const [userRole, setUserRole] = useState(null);
    const [cookies, setCookie, removeCookie] = useCookies();
    const [points, setPoints,] = useState<PointsTable[]>([]);

    // On load, set claim using cookies, get user role from it, then use user role to fetch from backend
    useEffect(() => {
        const token = cookies.jwt;
        if (token) {
            const claim: jwtClaim = jwt_decode(token);
            setUserRole(claim.role);
        }
        // making call to api
        console.log(`Component/PointsTable: TESTING: cookies.id = ${cookies.id}`);
        const fetchPoints = async () => {
            const response = await fetch(`http://localhost:3333/points/${5}`); // DEBUG: Temp code
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
                    <th>ID</th>
                    <th>Organization Name</th>
                    <th>Points</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>34</td>
                    <td>Amaze-on!</td>
                    <td>0</td>
                </tr>
                <tr>
                    <td>69</td>
                    <td>Nice Inc. </td>
                    <td>68</td>
                </tr>
                {
                    points.map((pointsTable) => (
                        <tr>
                            <td>{pointsTable.organizationID}</td>
                            <td>PointsTable.OrgName</td>
                            <td>{pointsTable.total}</td>
                        </tr>
                    ))
                }
                </tbody>
            </Table>
            );
    case 1: // sponsor
        // implement later
        break;
    case 2: // admin
        // implement later
        break;
    default: // loggedIn w/o role -> error from depreciated user
        console.log("PointsTable component: depreciated user attempting to access points!");
        break;
}
}

export default PointsTable;