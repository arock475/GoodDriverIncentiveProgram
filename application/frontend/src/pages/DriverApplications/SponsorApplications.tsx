import react, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import jwt_decode from "jwt-decode";
import SponsorApp from '../../components/Applications/SponsorApp';
import { Table } from 'react-bootstrap';


type Application = {
    organizationId: number,
    driverUserID: number,
    driverName: string,
    status: string
}

type jwtClaim = {
    authorized: boolean,
    role: number,
    id: number
}

const SponsorApplications: React.FC<{}> = () => {
    const [userId, setUserId] = useState(-1);
    const [appList, setAppList] = useState([]);
    const [cookies, setCookie, removeCookie] = useCookies();

    const renderApplications = () => {
        if (userId === -1) return;

        fetch(`http://localhost:3333/applications/sponsor?sponsorID=${userId}`, {
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
                    driverUserID: item.DriverUserID,
                    driverName: item.DriverName,
                    status: item.Status
                }

                formattedResponse.push(obj)
            })

            setAppList(formattedResponse)
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
    })


    return (
        <Table>
            <thead>
                <tr>
                    <th>Driver Name</th>
                    <th>Application Status</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {appList.map((item) => {
                    return <SponsorApp
                        key={`${item.driverUserID}-${item.status}`}
                        SponsorID={userId}
                        DriverID={item.driverUserID}
                        Name={item.driverName}
                        Status={item.status}
                        ParentCallback={renderApplications}
                    />
                }
                )}
            </tbody>
        </Table>
    )
}

export default SponsorApplications;