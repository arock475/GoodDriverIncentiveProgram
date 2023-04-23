import react, { useState } from 'react';
import { useCookies } from 'react-cookie';

import Button from 'react-bootstrap/Button';

export interface DriverApp {
    OrgID: number,
    UserID: number,
    Name: string,
    Status: String,
    Reason: String,
    ParentCallback: Function
}

const DriverApp: React.FC<DriverApp> = (props) => {
    const applicationHandler = () => {
        fetch(`http://localhost:3333/applications/driver?driverID=${encodeURIComponent(props.UserID)}&organizationID=${encodeURIComponent(props.OrgID)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include",
        })
        .then((response) => {
            if (!response.ok){
                throw new Error("Error submitting application")
            }

            props.ParentCallback()
        })
        .catch((err) => {
           console.log(err.message);
        });
    }

    return (
        <tr>
          <th>{props.Name}</th>
          <th>{props.Status}</th>
          <th>
            {
                props.Status==="Apply Now" ? // Status indicates driver has no existing application
                    <Button onClick={applicationHandler}>
                        Apply
                    </Button>
                :
                    <p>{props.Reason}</p>
            }
        </th>
        </tr>
    )
}

export default DriverApp