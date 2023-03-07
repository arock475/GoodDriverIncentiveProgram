import React, { SyntheticEvent, useState } from 'react'
import Container from 'react-bootstrap/Container'
import CreateAccount from '../Login/CreateAccount'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown'
import Buttom from 'react-bootstrap/Button'
import Button from 'react-bootstrap/Button'



// Create Driver Page
const CreateOrganization = ({ }) => {

    // called when submit but is hit
    // sends info to server API
    // pn: SyntheticEvents are React's version of events
    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();

        // getting info from the event target (the component that called the event)
        const target = event.target as typeof event.target & {
            name: { value: string };
            biography: { value: string };
            phone: { value: string };
            email: { value: string };
            logoURL: { value: string };
        }
        const name = target.name.value;
        const biography = target.biography.value;
        const phone = target.phone.value;
        const email = target.email.value;
        const logoURL = target.logoURL.value;

        // asking to API to create organizaiton
        // POTENTIAL ISSUE: Do I need await before fetch?
        const response = await fetch('http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/orgs', {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                bio: biography,
                phone: phone,
                email: email,
                logoURL: logoURL
            })
        }).catch(error => console.log(error));
        console.log(response)
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Row>
                <Col>
                    <Form.Label>Organization Name</Form.Label>
                    <Form.Control name="name" placeholder='Organization Name' />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Label>Organization Bio</Form.Label>
                    <Form.Control name="biography" placeholder='Describe your organization' />
                    <Form.Text></Form.Text>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Label>Organization Phone</Form.Label>
                    <Form.Control name="phone" placeholder='Enter a phone number to contact your organization' />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Label>Organization Email</Form.Label>
                    <Form.Control name='email' placeholder='Enter an email to contact your organization at' />
                </Col>
            </Row>
            {/* Later add capabilities to upload image */}
            <Row>
                <Col>
                    <Form.Label>Organization Logo</Form.Label>
                    <Form.Control name='logoURL' placeholder='Paste the URL linking to your organizations logo image' />
                </Col>
            </Row>
            <Row>
                <Col className="text-center">
                    <Button variant="primary" type="submit" >Create Org</Button>
                </Col>
            </Row>
        </Form>
    );
}

export default CreateOrganization;