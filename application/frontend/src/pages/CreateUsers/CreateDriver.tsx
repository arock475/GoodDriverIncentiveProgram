import React, { SyntheticEvent } from 'react'
import Container from 'react-bootstrap/Container'
import CreateAccount from '../Login/CreateAccount'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown'
import Buttom from 'react-bootstrap/Button'
import Button from 'react-bootstrap/Button'

import { useState, useEffect } from "react"

// interfacing representing incoming organization
interface Organization {
    ID: number
    Name: string
    Bio: string
    Phone: string
    Email: string
    LogoURL: string
}

// Create Driver Page
const CreateDriver = ({ }) => {

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
            truckType: { value: string };
            licenceNumber: { value: string };
        }

        // declaring const based on passed parameters
        const firstName = target.firstName.value;
        const lastName = target.lastName.value;
        const email = target.email.value;
        const password = target.password.value;
        const truckType = target.truckType.value;
        const licenceNumber = target.licenceNumber.value;
        const organizationId = selectedOrg.ID;
        // making call to api
        const response = await fetch('http://localhost:3333/users', {
            method: 'POST',
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                type: 0, //driver type
                organizationId: organizationId,
                truckType: truckType,
                licenceNumber: licenceNumber
            })
        }).catch(error => console.log(error));
        console.log(response);
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
            const response = await fetch('http://localhost:3333/orgs');
            const data = await response.json();
            setOrgsArray(data);
        };
        fetchOrgs();
    }, []);

    return (
        <div style={{ height: "100vh" }}>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col>
                        <Form.Label>First Name</Form.Label>
                        <Form.Control name="firstName" placeholder="First name" />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control name="lastName" placeholder="Last name" />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" placeholder='Email' />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" name="password" placeholder='Password' />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control type="password" name="confirmPassword" placeholder='Confirm Password' />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group>
                            <Form.Label>License Number</Form.Label>
                            <Form.Control name="licenceNumber" placeholder="License Number" />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Form.Group>
                        <Form.Label>Truck Type</Form.Label>
                        <Form.Control name="truckType" placeholder="Truck Type" />
                    </Form.Group>
                </Row>
                <Row>
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
                </Row>
                <Row>
                    <Col className="text-center">
                        <Button variant="primary" type="submit" >Submit</Button>
                    </Col>
                </Row>
            </Form>
        </div>

    );
}

export default CreateDriver;