import react, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import jwt_decode from "jwt-decode";
import App from '../App';
import { format } from 'path';
import DriverApp from '../../components/Applications/DriverApp';
import { Table } from 'react-bootstrap';


type Application = {
    organizationId: number,
    organizationName: number,
    status: string
}

type jwtClaim = {
    authorized: boolean,
    role: number,
    id: number
}

const DriverApplications: React.FC<{}> = () => {
    const [userId, setUserId] = useState(-1);
    const [orgList, setOrgList] = useState([]);
    const [cookies, setCookie, removeCookie] = useCookies();

    const renderApplications = () => {
        if (userId === -1) return;

        fetch(`http://localhost:3333/applications/driver?driverID=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include",
        }).then(async response => {
            const data = await response.json()

            const formattedResponse = [];

            data.forEach(item => {
                const obj: Application = {
                    organizationId: item.OrganizationID,
                    organizationName: item.OrganizationName,
                    status: item.Status
                }

                formattedResponse.push(obj)
            })

            setOrgList(formattedResponse)
        }).catch()
    }

    // Run when userId loads
    useEffect(() => {
        renderApplications()
    }, [userId])

    // On load use effect
    useEffect(() => {
        const token = cookies.jwt;
        if (token) {
            const decoded: jwtClaim = jwt_decode(token)

            setUserId(decoded.id)
        }
        else {
            throw new Error("Invalid login")
        }
    }, [])


    return (
        <Table>
            <thead>
                <tr>
                    <th>Organization</th>
                    <th>Application Status</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {orgList.map((item) => {
                    return <DriverApp
                        key={`${item.organizationId}-${item.status}`}
                        OrgID={item.organizationId}
                        UserID={userId}
                        Name={item.organizationName}
                        Status={item.status}
                        ParentCallback={renderApplications}
                    />
                }
                )}
            </tbody>
        </Table>
    )
}

export default DriverApplications