import { Row, Col, Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import CreateUser from '../../components/CreateUser/CreateUser'

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
                <CreateUser/>
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