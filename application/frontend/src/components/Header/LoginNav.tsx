import React, { useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { getUserClaims } from '../../utils/getUserClaims';

export type LoginNavProp = {
    viewAs: number
    setViewAs: React.Dispatch<React.SetStateAction<number>>
}


const LoginNav: React.FC<LoginNavProp> = ({viewAs, setViewAs}) => {
    const [userClaims, setUserClaims] = useState(getUserClaims());
    setViewAs(userClaims.role);
    return (
        <>  
            {userClaims.authorized ?
                <>
                    {userClaims.role === 1 &&
                        <div>
                            <text className='pe-3'>View As</text>
                            <div className='pe-3'>
                                <select name='selectview' defaultValue={userClaims.role} onChange={event => setViewAs(parseInt(event.target.value,10))}>
                                    <option value={userClaims.role}>Default</option>
                                    <option value={0}>Driver</option>
                                </select>
                            </div>
                        </div>
                    }
                    {userClaims.role === 2 &&
                        <div>
                            <text className='pe-3'>View As {viewAs}</text>
                            <div className='pe-3'>
                                <select name='selectview' defaultValue={userClaims.role} onChange={event => setViewAs(parseInt(event.target.value,10))}>
                                    <option value={userClaims.role}>Default</option>
                                    <option value="0">Driver</option>
                                    <option value="1">Sponsor</option>
                                </select>
                            </div>
                        </div>
                    }
                    <NavDropdown align="end" title={userClaims.user} id="profile-navbar-dropdown">
                        <NavDropdown.Item href={`/user/${userClaims.id}`}>Profile</NavDropdown.Item>
                        <NavDropdown.Item href={`/applications`}>Applications</NavDropdown.Item>
                        <NavDropdown.Item href="/logout">Logout</NavDropdown.Item>
                    </NavDropdown>
                    <Nav>
                        <img src={`https://team25-s3bucket.s3.amazonaws.com/profilepicture-default.gif`} width={60} height={60} alt=''></img>
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