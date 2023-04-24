import React, { useState, useEffect } from 'react';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { getUserClaims } from '../../utils/getUserClaims';

export type LoginNavProp = {
    viewAs: number
    setViewAs: React.Dispatch<React.SetStateAction<number>>
}


const LoginNav: React.FC<LoginNavProp> = ({viewAs, setViewAs}) => {
    const [userClaims, setUserClaims] = useState(getUserClaims());
    useEffect(() => {
        setViewAs(userClaims.role);
    }, [])
   

    // handle viewAsChanges
    const viewAsChanged = async (event) => {
        const num: number = parseInt(event.target.value, 10); 
        console.log(num);
        setViewAs(num);
    }

    return (
        <>  
            {userClaims.authorized ?
                <>
                    {userClaims.role === 1 &&
                        <div>
                            <p className='pe-3'>View As</p>
                            <div className='pe-3'>
                                <select name='selectview' defaultValue={userClaims.role} onChange={viewAsChanged}>
                                    <option value={userClaims.role}>Default</option>
                                    <option value={0}>Driver</option>
                                </select>
                            </div>
                        </div>
                    }
                    {userClaims.role === 2 &&
                        <div>
                            <p className='pe-3'>View As</p>
                            <div className='pe-3'>
                                <select name='selectview' onChange={viewAsChanged}>
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
                        <img src={`https://team25-s3bucket.s3.amazonaws.com/Default-PFP.jpg`} width={60} height={60} alt=''></img>
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