import react, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import jwt_decode from "jwt-decode";
import DriverApp from '../../components/Applications/DriverApp';
import { Table } from 'react-bootstrap';
import { getUserClaims } from '../../utils/getUserClaims';


type Application = {
    organizationId: number,
    organizationName: number,
    status: string,
    reason: string
}

type jwtClaim = {
    authorized: boolean,
    role: number,
    id: number
}

const DriverApplications: React.FC<{}> = () => {
    const [userClaims, setUserClaims] = useState(getUserClaims());
    const [orgList, setOrgList] = useState([]);

    const renderApplications = () => {
        fetch(`http://http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/applications/driver?driverID=${userClaims.id}`, {
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
                    status: item.Status,
                    reason: item.Reason
                }

                formattedResponse.push(obj)
            })

            setOrgList(formattedResponse)
        }).catch()
    }

    useEffect(() => {
        renderApplications();
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
                        UserID={userClaims.id}
                        Name={item.organizationName}
                        Status={item.status}
                        Reason={item.reason}
                        ParentCallback={renderApplications}
                    />
                }
                )}
            </tbody>
        </Table>
    )
}

export default DriverApplications