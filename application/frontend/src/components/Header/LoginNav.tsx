import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Logout from '../Login/Logout';
import NavDropdown from 'react-bootstrap/NavDropdown';

export type LoginNav = {
    loggedIn: boolean,
    loginUser?: string,
    loginId?: number
}

const LoginNav: React.FC<LoginNav> = ({
    loggedIn=false,
    loginUser="",
    loginId=1
}) => {
    if(loggedIn){
        return (
        <>
            <NavDropdown align="end" title={loginUser} id="profile-navbar-dropdown">
                <NavDropdown.Item href={`/user/${loginId}`}>Profile</NavDropdown.Item>
                <NavDropdown.Item href={`/applications`}>Applications</NavDropdown.Item>
                <NavDropdown.Item href="/logout">Logout</NavDropdown.Item>
            </NavDropdown>
            <Nav>
                <img src={"https://team25-s3bucket.s3.amazonaws.com/profilepicture-default.gif"} width={60} height={60}></img>
            </Nav>
        </>
        )
    }

    return (
        <Nav>
            <Nav.Link href={`/login`} className="nav-link">Login</Nav.Link>
        </Nav>
    )
}

export default LoginNav;