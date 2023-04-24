import React, { useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import NavDropdown from 'react-bootstrap/NavDropdown';
import LoginNav from './LoginNav';
import logo from '../../assets/truck-logo.jpg';
import "../../styles/components/Header.css";
import { getUserClaims } from '../../utils/getUserClaims';

export type HeaderProps = {
    colorTheme?: string,
    viewAs?: number
    setViewAs?: React.Dispatch<React.SetStateAction<number>>
}

enum User {
    Driver = 0,
    Sponsor = 1,
    Admin = 2,
    Invalid = -1
}

const Header: React.FC<HeaderProps> = ({
    colorTheme = "dark", viewAs, setViewAs
}) => {
    const [userClaims, setUserClaims] = useState(getUserClaims());

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
                            <NavDropdown.Item href="/catalog">Catalog</NavDropdown.Item>
                            <NavDropdown.Item href="/points">Points</NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="Create" id="create-navbar-dropdown">
                            <NavDropdown.Item href="/create-user">User</NavDropdown.Item>
                            {((userClaims.role === User.Sponsor || userClaims.role === User.Admin) && (viewAs === User.Sponsor || viewAs === User.Admin)) &&
                                <NavDropdown.Item href="/create-org">Organization</NavDropdown.Item>
                            }
                        </NavDropdown>
                        {(userClaims.role == User.Admin  || viewAs == User.Admin) &&
                            <NavDropdown title="Delete" id="delete-navbar-dropdown">
                                
                                <NavDropdown.Item href="/delete-user">User</NavDropdown.Item>
                            </NavDropdown>
                        }
                        <Nav.Link href="/driver/orders" className="nav-link">Orders</Nav.Link>
                        <Nav.Link href="/orgs" className="nav-link">Organizations</Nav.Link>
                        <Nav.Link href="/driver/notifications" className="nav-link">Notifications</Nav.Link>
                        <Nav.Link href="/search" className="nav-link">Search</Nav.Link>
                        {((userClaims.role === User.Sponsor || userClaims.role === User.Admin) && (viewAs === User.Sponsor || viewAs === User.Admin)) &&
                            <NavDropdown title="Reports" id="create-navbar-dropdown">
                                <NavDropdown.Item href="/reports/points">Driver Reports</NavDropdown.Item>
                                <NavDropdown.Item href="/reports/sponsor/sales">Sponsor Sales Reports</NavDropdown.Item>
                                <NavDropdown.Item href="/reports/sales-by-driver">Sales By Driver</NavDropdown.Item>
                            </NavDropdown>
                        }
                    </Nav>
                    <LoginNav viewAs={viewAs} setViewAs={setViewAs} />
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default Header;