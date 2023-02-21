import React from 'react';
import Nav from 'react-bootstrap/Nav';


export type LoginNav = {
    loggedIn: boolean,
    loginUser?: string
}

const LoginNav: React.FC<LoginNav> = ({
    loggedIn=false,
    loginUser=""
}) => {
    if(loggedIn){
        return (
        <Nav>
            <Nav.Link href={`/user/${loginUser}`} className="nav-link">
                {loginUser}
                <img src={"https://team25-s3bucket.s3.amazonaws.com/profilepicture-default.gif"} width={60} height={60}></img>
            </Nav.Link>
        </Nav>
        )
    }

    return (
        <Nav>
            <Nav.Link href={`/login`} className="nav-link">Login</Nav.Link>
        </Nav>
    )
}

export default LoginNav;