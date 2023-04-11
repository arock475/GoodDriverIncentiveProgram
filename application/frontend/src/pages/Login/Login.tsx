import react, { useState, useEffect } from 'react';
import { FormGroup } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Link from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [credentialError, setCredentialError] = useState(false);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    try {
      fetch("http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({
          'email': email,
          'password': password,
        })
      }).then(async response => {
        // check for error response
        if (!response.ok) {
          setCredentialError(true)
          return
        }

        setCredentialError(false)

        sessionStorage.setItem("reload", "true")
        navigate(0)
      }).catch(error => {
        setCredentialError(true)
      })
    }
    catch (err) {
      console.log("ERROR")
      setCredentialError(true)
    }
  }

  useEffect(() => {
    const isReload = sessionStorage.getItem("reload")
    if (isReload === "true") {
      sessionStorage.removeItem("reload");
      navigate("/")
    }
  }, [])

  return (
    <Container className="d-flex flex-column">
      <Row className="flex-fill align-content-center justify-content-center">
        <Col lg={8}>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Form.Label>Email</Form.Label>
              <Form.Control type="email"
                placeholder='Enter Email'
                className='w-100'
                onChange={e => setEmail(e.target.value)}
                isInvalid={credentialError}
              />
              <Form.Control.Feedback type='invalid'>
                Invalid email or password
              </Form.Control.Feedback>
            </FormGroup>
            <FormGroup>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                onChange={e => setPassword(e.target.value)}
                isInvalid={credentialError}
              />
              <Form.Control.Feedback type='invalid'>
                Invalid email or password
              </Form.Control.Feedback>
            </FormGroup>
            <div className='text-center'>
              <Button
                variant='primary'
                type='submit'
                color='blue'>
                Login
              </Button>
            </div>
          </Form>
          <a href={"/login/create"}>
            Create Account
          </a>
        </Col>
      </Row>
    </Container>
  )
}

export default Login;