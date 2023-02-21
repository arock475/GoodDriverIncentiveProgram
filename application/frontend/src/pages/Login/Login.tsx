import { FormGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const Login = () => {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "lightBlue",
      height:"90vh"
    }}>
      <Form>
        <FormGroup>
          <Form.Label>Username</Form.Label>
          <Form.Control type="email" placeholder='Enter Username' className='w-100'/>
        </FormGroup>
        <FormGroup>
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password" />
        </FormGroup>
        <div className='text-center'>
          <Button variant='primary' type='submit' color='blue'>
            Login
          </Button>
        </div>
        <div className='text-center'>
          <Button variant='secondary' type='submit' color='blue' href='/Create-Account'>
            Create Account
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default Login;