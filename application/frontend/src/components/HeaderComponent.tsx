import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import logo from '../assets/truck-logo.jpg';

export type HeaderProps = {
    colorTheme: string,
    loggedIn: boolean,
    loginUser?: string,
    profilePictureUrl: string
}

const HeaderComponent: React.FC<HeaderProps> = ({
    colorTheme="dark",
    loggedIn=false,
    loginUser,
    profilePictureUrl
}) => {
    return (
        <Navbar bg={colorTheme} expand="lg">
            <Container>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Brand href="/">
                    <img src={logo} alt="logo" width="60" height="60" className="d-inline-block align-top"/>
                </Navbar.Brand>
                <Nav className='me-auto'>
                    <Nav.Link href="/">Home</Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    )
}

export default HeaderComponent;