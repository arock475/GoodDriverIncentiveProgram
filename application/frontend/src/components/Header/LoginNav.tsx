import React, { useState, useEffect } from 'react';
import Nav from 'react-bootstrap/Nav';
import Logout from '../Login/Logout';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { getUserClaims } from '../../utils/getUserClaims';

export type LoginNav = {
}

const LoginNav: React.FC<LoginNav> = ({ }) => {
    const [userClaims, setUserClaims] = useState(getUserClaims());

    return (
        <>
            {userClaims.authorized ?
                <>
                    <NavDropdown align="end" title={userClaims.user} id="profile-navbar-dropdown">
                        <NavDropdown.Item href={`/user/${userClaims.id}`}>Profile</NavDropdown.Item>
                        <NavDropdown.Item href={`/applications`}>Applications</NavDropdown.Item>
                        <NavDropdown.Item href="/logout">Logout</NavDropdown.Item>
                    </NavDropdown>
                    <Nav>
                        <img src={`https://team25-s3bucket.s3.amazonaws.com/profilepicture-default.gif`} width={60} height={60}></img>
                    </Nav>
                </>

                :
                <Nav>
                    <Nav.Link href={`/login`} className="nav-link">Login</Nav.Link>
                </Nav>

            }
        </>
    )
}

export default LoginNav;