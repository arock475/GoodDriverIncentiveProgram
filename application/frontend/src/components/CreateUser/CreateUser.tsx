import React, { SyntheticEvent } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form';

const CreateUser = ({}) => {
    return (
        <div>
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
                    <Form.Control type="email" name="email" placeholder='johndoe@email.com' />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" name="password"/>
                </Col>
            </Row>
        </div>
    )
}

export default CreateUser;