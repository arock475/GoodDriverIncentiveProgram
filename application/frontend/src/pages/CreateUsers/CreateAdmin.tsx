import React, { SyntheticEvent } from 'react'
import Container from 'react-bootstrap/Container'
import CreateAccount from '../Login/CreateAccount'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown'
import Buttom from 'react-bootstrap/Button'
import Button from 'react-bootstrap/Button'

import {useState, useEffect} from "react"

// Create Driver Page
const CreateAdmin = ({}) => {

    // handling form submit. Sending post request to database
    const handleSubmit = async (event: React.SyntheticEvent) => {     
        event.preventDefault();
        // getting info from the event target
        const target = event.target as typeof event.target & {
            // user values
            firstName : {value : string};
            lastName : {value : string};
            email : {value : string};
            password : {value : string};
        }

        // declaring const based on passed parameters
        const firstName = target.firstName.value;
        const lastName = target.lastName.value;
        const email = target.email.value;
        const password = target.password.value;
        const type = 2;
        // making call to api
        const response = await fetch('http://localhost:3333/users', {
            method: 'POST',
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                type: type,
            })
        }).catch(error => console.log(error));
        console.log(response);
    }
    return (
        <div style={{height:"100vh"}}>
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
                    <Col className="text-center">
                        <Button variant="primary" type="submit" >Submit</Button>
                    </Col>
                </Row>   
            </Form>
        </div>
    );
}

export default CreateAdmin;