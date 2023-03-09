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

    const [userRole, setUserRole] = useState(null);
    const [cookies, setCookie, removeCookie] = useCookies();
    useEffect(() => {
        const token = cookies.jwt;
        if (token) {
            const claim: jwtClaim = jwt_decode(token);
            setUserRole(claim.role);
        }
    }, [])

    console.log(`PointsTable comp: ${userRole}`);
    switch (userRole) {
        case 0: // driver
            console.log("PointsTable component: rendering driver table");
            return (
                <Table striped bordered hover>
                <thead>
                <tr>
                    <th>#</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Username</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>1</td>
                    <td>Mark</td>
                    <td>Otto</td>
                    <td>@mdo</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Jacob</td>
                    <td>Thornton</td>
                    <td>@fat</td>
                </tr>
                <tr>
                    <td>3</td>
                    <td colSpan={2}>Larry the Bird</td>
                    <td>@twitter</td>
                </tr>
                </tbody>
            </Table>
            );
    case 1: // sponsor
        // impplement later
        break;
    case 2: // admin
        // implement later
        break;
    default: // loggedIn w/o role -> error from depreciated user
        console.log("PointsTable component: depreciated user");
        break;
}
}

export default PointsTable;