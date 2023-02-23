import react from 'react';
import { FormGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import React from 'react';

const CreateAccount = () => {

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
        firstName : { value: string };
        lastName : { value: string };
        email : { value: string };
        password: { value: string };
    };

    const firstName = target.firstName.value;
    const lastName = target.lastName.value;
    const email = target.email.value;
    const password = target.password.value;

    const response = await fetch('http://localhost:3333/users', {
        method: 'POST',
        body: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            email: email, 
            password: password,
            type: 0
        })});
    
    console.log(response.json())
  }

  return (
    <div style={{
        backgroundColor: "LightBlue",
        height:"90vh"
    }}>
        <div className='text-center'>
            <p>
                Create Account
            </p>
        </div>
        <div>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col>
                        <Form.Label>First Name</Form.Label>
                        <Form.Control name="firstName" placeholder="First name" />
                    </Col>
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
                    <Col className='text-center'>
                        <Button variant='primary' type='submit' color='blue'>
                            Sign Up 
                        </Button>
                    </Col>
                </Row>
            </Form>
        </div>
    </div>
  );
}


export default CreateAccount;