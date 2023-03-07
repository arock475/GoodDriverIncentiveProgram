import React, { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import CreateUser from '../../components/CreateUser/CreateUser';
import { Button } from 'react-bootstrap';

// interfacing representing incoming organization
interface Organization {
    ID: number
    Name: string
    Bio: string
    Phone: string
    Email: string
    LogoURL: string
}

const CreateSponsor = ({ }) => {
    const [emailInUse, setEmailInUse] = useState(true);

    // creating an org data constant to receive the data from fetch
    const [orgsArray, setOrgsArray] = useState<Organization[]>([])
    const [selectedOrg, setSelectedOrg] = useState<Organization>({
        ID: 0,
        Name: '',
        Bio: '',
        Phone: '',
        Email: '',
        LogoURL: ''
    })
    // handling form submit. Sending post request to database
    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        // getting info from the event target (the component that called the event)
        const target = event.target as typeof event.target & {
            // user values
            firstName: { value: string };
            lastName: { value: string };
            email: { value: string };
            password: { value: string };
        }

        // declaring const based on passed parameters
        const firstName = target.firstName.value;
        const lastName = target.lastName.value;
        const email = target.email.value;
        const password = target.password.value;
        const organizationId = selectedOrg.ID;
        // making call to api
        const response = await fetch('http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/users', {
            method: 'POST',
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                type: 1, //sponsor type
                organizationId: organizationId
            })
        }).then(async response => {
            if (response.status === 409) {
                setEmailInUse(true)
                return
            }

            setEmailInUse(false)
        }).catch(
            error => {
                setEmailInUse(true)
                console.log(error)
            }
        )
    }

    // handling selection changed to 
    const handleOrgChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const organizationId = parseInt(event.target.value);
        setSelectedOrg(orgsArray.find((org) => org.ID == organizationId) || {
            ID: 0,
            Name: '',
            Bio: '',
            Phone: '',
            Email: '',
            LogoURL: ''
        });
    };

    // populating organizations list
    useEffect(() => {
        // Fetch names from API and update state
        const fetchOrgs = async () => {
            const response = await fetch('http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/orgs');
            const data = await response.json();
            setOrgsArray(data);
        };
        fetchOrgs();
    }, []);

    return (
        <div>
            <Form onSubmit={handleSubmit}>
                <CreateUser emailInUse={emailInUse} />
                <Form.Group>
                    <Form.Label>Associated Organization</Form.Label>
                    <Form.Control as='select' onChange={handleOrgChange}>
                        <option value="">Select an Organization</option>
                        {
                            orgsArray.map((org) => (
                                <option key={org.ID} value={org.ID}>{org.Name}</option>
                            ))
                        }
                    </Form.Control>
                    <Form.Text>Select an organization to associate this sponsor within.</Form.Text>
                </Form.Group>
                <Row>
                    <Col className='text-center'>
                        <Button type='submit'>Submit</Button>
                    </Col>
                </Row>
            </Form>
        </div>

    );
}

export default CreateSponsor;