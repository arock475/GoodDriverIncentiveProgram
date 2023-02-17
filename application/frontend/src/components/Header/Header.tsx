import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import NavDropdown from 'react-bootstrap/NavDropdown';
import LoginNav from './LoginNav'
import logo from '../../assets/truck-logo.jpg';
import "../../styles/components/Header.css"

export type HeaderProps = {
    colorTheme: string,
    loggedIn: boolean,
    loginUser?: string,
}

const Header: React.FC<HeaderProps> = ({
    colorTheme="dark",
    loggedIn=false,
    loginUser="",
}) => {
    return (
        <Navbar bg={colorTheme} expand="sm" className="header navbar-header" id="header-navbar">
            <Container>
                <Navbar.Brand href="/">
                    <img src={logo} alt="logo" width="60" height="60" className="d-inline-block align-top"/>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="driver-incentive-navbar" />
                <Navbar.Collapse id="driver-incentive-navbar">
                    <Nav className="me-auto">
                        <Nav.Link href="/" className="nav-link">Home</Nav.Link>
                        <NavDropdown title="Points" id="points-navbar-dropdown">
                            <NavDropdown.Item href="/store">Store</NavDropdown.Item>
                            <NavDropdown.Item href="/points">Point History</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        <LoginNav loggedIn={loggedIn} loginUser={loginUser}/>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default Header;