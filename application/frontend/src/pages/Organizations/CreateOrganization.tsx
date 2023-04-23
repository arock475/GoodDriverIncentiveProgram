import React, { SyntheticEvent, useState } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'
import { getUserClaims } from '../../utils/getUserClaims'
import { User } from '../../components/CreateUser/CreateUser';



const CreateOrganization = ({}) => {
    // claim
    const [userClaims, setUserClaims] = useState(getUserClaims()); 

    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
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
        const response = await fetch('http://localhost:3333/orgs', {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                bio: biography,
                phone: phone,
                email: email,
                logoURL: logoURL
            })
        })
        .then(response => {
            if (response.status >= 200 && response.status < 300) {
                const resubmit = (userClaims.role == User.Sponsor || userClaims.role == User.Admin) ? window.confirm('Do you want to create another organization?') : false;   
                if (resubmit) {
                    window.location.href = '/create-org';
                }
                else {
                    window.location.href = '/'
                }
            }
        })
        .catch(error => console.log(error));
        console.log(response)
    }
    if (userClaims.role == User.Admin) {
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
    } else {
        return (
          <div>ERROR! Improper role for accessing this page!</div>  
        );
    }
    
}


export default CreateOrganization;