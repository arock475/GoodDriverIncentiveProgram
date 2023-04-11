import react, { useState } from 'react';
import { FormGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const CreateAccount = () => {
    const [emailInUse, setEmailInUse] = useState(true);


    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        const target = e.target as typeof e.target & {
            firstName: { value: string };
            lastName: { value: string };
            email: { value: string };
            password: { value: string };
        };

        const firstName = target.firstName.value;
        const lastName = target.lastName.value;
        const email = target.email.value;
        const password = target.password.value;

        const response = await fetch('http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/users', {
            method: 'POST',
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                type: 0
            })
        }).then(async response => {
            if (!response.ok) {
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

    return (
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
            <FormGroup>
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    placeholder='Email'
                    isInvalid={!emailInUse}
                />
            </FormGroup>
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
    );
}


export default CreateAccount;