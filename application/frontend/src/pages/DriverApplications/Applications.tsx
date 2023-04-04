import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import jwt_decode from "jwt-decode";
import DriverApplications from "./DriverApplications"
import SponsorApplications from "./SponsorApplications"

type jwtClaim = {
    authorized: boolean,
    role: number,
    id: number
}

const Applications: React.FC<{}> = () => {
    const [role, setRole] = useState(-1);
    const [cookies, setCookie, removeCookie] = useCookies();

    useEffect(() => {
        const token = cookies.jwt;
        if (token) {
            const decoded: jwtClaim = jwt_decode(token)

            setRole(decoded.role)
        }
        else {
            throw new Error("Invalid login")
        }
    }, [])

    if (role === 0) return <DriverApplications/>;
    if (role === 1) return <SponsorApplications/>;
}

export default Applications;