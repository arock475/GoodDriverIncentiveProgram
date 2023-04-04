import React, {useEffect, useState } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import { Button } from 'react-bootstrap'
import { getUserClaims } from '../../utils/getUserClaims';

interface Organization {
    ID: number
    Name: string
    Bio: string
    Phone: string
    Email: string
    LogoURL: string
}

interface Sponsor {
    ID: number,
    UserID: number, 
    OrganizationID: number
}

export enum User {
    Driver = 0,
    Sponsor = 1,
    Admin = 2,
}

export type CreateProps = {
    colorTheme?: string,
    viewAs?: number
    setViewAs?: React.Dispatch<React.SetStateAction<number>>
}

const CreateUser: React.FC<CreateProps> = ({ colorTheme="dark", viewAs, setViewAs}) => {
    // claim
    const [userClaims, setUserClaims] = useState(getUserClaims()); 
    // organizations
    const [orgs, setOrgs] = useState<Organization[]>([])
    const [selectedOrg, setSelectedOrg] = useState<Organization>({
        ID: 0,
        Name: '',
        Bio: '',
        Phone: '',
        Email: '',
        LogoURL: ''
    })
    // password
    const [password, setPassword] = useState<string>("");
    const  [confPassword, setConfPassword] = useState<string>("");
    // email
    const [emailInUse, setEmailInUse] = useState(false);
    // type of user being created
    const [creating, setCreating] = useState<number | null>(null);

    // password changes
    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const handleConfPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConfPassword(event.target.value);
    };

    const isPasswordComplex = () => {
        const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        // secret hidden bypass >:)
        if (password !== "x")
            return regex.test(password);
        else
            return true;
    };

    const passwordsMatch = () => {
        return password === confPassword;
    };

    // setting selected org
    const handleOrgChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const organizationId = parseInt(event.target.value);
        setSelectedOrg(orgs.find((org) => org.ID == organizationId) || {
            ID: 0,
            Name: '',
            Bio: '',
            Phone: '',
            Email: '',
            LogoURL: ''
        });
    };

    // setting creating
    const handleCreatingChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setCreating(parseInt(event.target.value))
    }

    useEffect(() => {
        // load sponsor's org
        const fetchSponsorOrg = async () => {
            const s_response = await fetch(`http://localhost:3333/sponsors/u:${userClaims.id}`);
            const sponsor: Sponsor = await s_response.json();
            const o_response = await fetch(`http://localhost:3333/orgs/${sponsor.OrganizationID}`);
            const org: Organization = await o_response.json();
            setSelectedOrg(org);
        }
        if (userClaims.role == User.Sponsor) {
            fetchSponsorOrg(); 
        }
    }, [creating])

    useEffect(() => {
        // load orgs
        const fetchOrgs = async () => {
            const response = await fetch('http://localhost:3333/orgs');
            const data = await response.json();
            setOrgs(data);
        };
        fetchOrgs();
        setCreating(User.Driver);
    }, []);

    // submit
    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();

        // submission
        const target = event.target as typeof event.target & {
            firstName: { value: string };
            lastName: { value: string };
            email: { value: string };
            password: { value: string };
            truckType: { value: string };
            licenceNumber: { value: string };
        }

        const formData = {
            firstName: target.firstName.value,
            lastName: target.lastName.value,
            email: target.email.value,
            password: target.password.value,
            type: creating,
            ...((creating==User.Driver || creating==User.Sponsor) ? {organizationId: selectedOrg.ID} : {}),
            ...((creating==User.Driver) ? {truckType: target.truckType.value,} : {}),
            ...((creating==User.Driver) ? {licenceNumber: target.licenceNumber.value,} : {})
        }
        const response = await fetch('http://localhost:3333/users', {
            method: 'POST',
            body: JSON.stringify(formData)
        }).then(async response => {
            if (response.status === 409) {
                setEmailInUse(true)
                return
            }
            else if (response.status >= 200 && response.status < 300) {
                // resubmit dialog
                const resubmit = (userClaims.role == User.Sponsor || userClaims.role == User.Admin) ? window.confirm('Do you want to create another user?') : false;   
                if (resubmit) {
                    window.location.href = '/login/create';
                }
                else if (!userClaims.authorized) {
                    window.location.href = '/login/'
                }
                else {
                    window.location.href = '/'
                }
            }
            setEmailInUse(false)
        }).catch(
            error => {
                setEmailInUse(true)
                console.log(error)
            }
        )
    }
    // html
    return (
        <>
        <Form onSubmit={handleSubmit}>
            <div>
                { (userClaims.role === User.Admin || userClaims.role === User.Sponsor) && (viewAs === User.Admin || viewAs === User.Sponsor) && (    
                    <Form.Group>
                        <Form.Label>Select a User to Create </Form.Label>           
                        <Form.Control as='select' onChange={handleCreatingChange}>
                            <option value={User.Driver}>Driver</option>
                            <option value={User.Sponsor}>Sponsor</option>
                            { (userClaims.role === User.Admin && viewAs === User.Admin) && <option value={User.Admin}>Admin</option>}
                        </Form.Control>
                    </Form.Group>
                )}
            </div>
            <Row>
                <Col>
                    <Form.Label>First Name</Form.Label>
                    <Form.Control name="firstName" placeholder="John" />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control name="lastName" placeholder="Doe" />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Label>Email</Form.Label>
                    <Form.Control 
                        type="email" 
                        name="email" 
                        placeholder='johndoe@email.com' 
                        isInvalid={emailInUse}
                    />
                    <Form.Control.Feedback type='invalid'>
                        Email in use
                    </Form.Control.Feedback>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" name="password" value={password} onChange={handlePasswordChange}/>
                    { !isPasswordComplex() && 
                        <Form.Text className="text-danger">
                            Password must be at least 8 characters long and contain at least one digit, one lowercase letter, and one uppercase letter.
                        </Form.Text>
                    }
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control type="password" name="confPassword" value={confPassword} onChange={handleConfPasswordChange}/>
                    { !passwordsMatch() && 
                        <Form.Text className="text-danger">
                            Passwords do not match.
                        </Form.Text>
                    }
                </Col>
            </Row>
            <div>
                { (creating == User.Driver) && (
                    <div>
                        <Form.Group>
                            <Form.Label>Truck Type</Form.Label>
                            <Form.Control name="truckType" placeholder="Truck Type" />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Licence Plate</Form.Label>
                            <Form.Control name="licenceNumber" placeholder="XXX XXXX" />
                        </Form.Group>
                    </div>
                )}
            </div>
            <div>
                { /* Assigning Organizations by Choice */ }
                {(((creating === User.Driver && userClaims.role !== User.Sponsor) || (creating === User.Sponsor && userClaims.role === User.Admin)) && (viewAs === User.Admin || viewAs === User.Driver)) &&
                    <div>
                        <Form.Group>
                            <Form.Label>Associated Organization</Form.Label>
                            <Form.Control as='select' onChange={handleOrgChange}>
                                <option value="">Select an Organization</option>
                                {
                                    orgs.map((org) => (
                                        <option key={org.ID} value={org.ID}>{org.Name}</option>
                                    ))
                                }
                            </Form.Control>
                            <Form.Text>Select an organization to associate this sponsor within.</Form.Text>
                        </Form.Group>
                    </div>
                }
                { /* Assigning Organizations by Default */ }
                { (creating === User.Driver || creating === User.Sponsor) && ((userClaims.role === User.Sponsor) || (viewAs === User.Sponsor)) && 
                    <div>
                        <Form.Group>
                            <Form.Label>Associated Organization</Form.Label>
                            <Form.Control as='select' disabled>
                                <option key={selectedOrg.ID} value={selectedOrg.ID}>{selectedOrg.Name}</option>
                            </Form.Control>
                        </Form.Group>
                    </div>
                }
            </div>
            <Row>
                <Col className="text-center">
                    <Button variant="primary" type="submit" disabled={!passwordsMatch() || !isPasswordComplex()}>Submit</Button>
                </Col>
            </Row>
        </Form>
        </>
    )
}

export default CreateUser;