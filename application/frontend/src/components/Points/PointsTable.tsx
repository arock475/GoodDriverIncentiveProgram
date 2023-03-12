import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap';
import jwt_decode from 'jwt-decode'
import { useCookies } from 'react-cookie';

export type jwtClaim = {
    authorized: boolean,
    email: string,
    role: number
}

const PointsTable = ({}) => {  

    // user role and cookies variables
    const [userRole, setUserRole] = useState(null);
    const [cookies, setCookie, removeCookie] = useCookies();

    // On load, set claim using cookies, get user role from it
    useEffect(() => {
        const token = cookies.jwt;
        if (token) {
            const claim: jwtClaim = jwt_decode(token);
            setUserRole(claim.role);
        }
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