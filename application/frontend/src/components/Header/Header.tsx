import React, { useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import NavDropdown from 'react-bootstrap/NavDropdown';
import LoginNav from './LoginNav';
import logo from '../../assets/truck-logo.jpg';
import "../../styles/components/Header.css";

export type HeaderProps = {
    colorTheme?: string,
}

const Header: React.FC<HeaderProps> = ({
    colorTheme="dark",
}) => {
    return (
        <Navbar bg={colorTheme} expand="sm" className="header navbar-header mb-3" id="header-navbar">
            <Container>
                <Navbar.Brand href="/">
                    <img src={logo} alt="logo" width="60" height="60" className="d-inline-block align-top" />
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="driver-incentive-navbar" />
                <Navbar.Collapse id="driver-incentive-navbar">
                    <Nav className="me-auto">
                        <Nav.Link href="/" className="nav-link">Home</Nav.Link>
                        <NavDropdown title="Points" id="points-navbar-dropdown">
                            <NavDropdown.Item href="/store">Store</NavDropdown.Item>
                            <NavDropdown.Item href="/points">Point History</NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="Create" id="create-navbar-dropdown">
                            <NavDropdown.Item href="/create-user">User</NavDropdown.Item>
                            <NavDropdown.Item href="/create-org">Organization</NavDropdown.Item>
                        </NavDropdown>
                        <Nav.Link href="/driver/orders" className="nav-link">Orders</Nav.Link>
                        <Nav.Link href="/driver/organizations" className="nav-link">Organizations</Nav.Link>
                        <Nav.Link href="/driver/notifications" className="nav-link">Notifications</Nav.Link>
                        <Nav.Link href="/search" className="nav-link">Search</Nav.Link>
                    </Nav>

                    <LoginNav />
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default Header;