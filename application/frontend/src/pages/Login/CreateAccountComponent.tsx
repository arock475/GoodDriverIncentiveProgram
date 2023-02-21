import react from 'react';
import { FormGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import React from 'react';
import bcrypt from 'bcryptjs'

const CreateAccount = () => {

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
        email : { value: string };
        password: { value: string };
    };

    const email = target.email.value;
    const plaintextPassword = target.password.value;

    const saltRounds = 10;
    const hash: string = await bcrypt.hash(plaintextPassword, saltRounds);

    const response = await fetch('http://localhost:3333/users', {
        method: 'POST',
        body: JSON.stringify({
            email: email, 
            password: hash,
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
                        <Form.Control placeholder="First name" />
                    </Col>
                    <Col>
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control placeholder="Last name" />
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