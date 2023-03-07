import { useEffect, useState } from 'react';
import { Button, Col, Form, ListGroup, Row, Table } from 'react-bootstrap';


// interfacing representing incoming organizations
interface Organization {
    ID: number
    Name: string
    Bio: string
    Phone: string
    Email: string
    LogoURL: string
}

const DeleteOrg = ({}) => {

    // creating an org data constant to receive the data from fetch
    const [orgs, setOrgs] = useState<Organization[]>([])
    const [selectedOrg, setSelectedOrg] = useState<Organization>({
        ID: 0,
        Name: '',
        Bio: '',
        Phone: '',
        Email: '',
        LogoURL: ''
    })

    const handleSubmit = async (event: React.SyntheticEvent) => {
        // making call to api
        const response = await fetch(`http://localhost:3333/orgs/${selectedOrg.ID}`, {
            method: 'DELETE'
        }).catch(error => console.log(error));
        console.log(response);
    }

    // populating list of orgs
    useEffect(() => {
        // Fetch names from API and update state
        const fetchOrgs = async () => {
          const response = await fetch('http://localhost:3333/orgs');
          const data = await response.json();
          setOrgs(data);
        };
        fetchOrgs();
      }, []);
      
    // keeping track of what org is selected
    const handleOrgChange = async (event: React.ChangeEvent<HTMLInputElement>) => {     
        const organizationId = parseInt(event.target.value);
        setSelectedOrg(orgs.find((org) => org.ID == organizationId));
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Row>
                <Col>                    
                    <Form.Group>
                        <Form.Label>Organizations</Form.Label>
                        <Form.Control as='select' onChange={handleOrgChange}>
                            <option value="">Select an Organization</option>
                            {
                                orgs.map((org) => (
                                    <option key={org.ID} value={org.ID}>
                                        {`ID: ${org.ID} Name: "${org.Name}`}
                                    </option>
                                ))
                            }
                        </Form.Control>
                        <Form.Text>Select an organization to delete.</Form.Text>
                    </Form.Group>
                </Col>
            </Row>   
            <Row>
                <Col className="text-center">
                    <Button type='submit' onSubmit={handleSubmit}>Submit</Button>
                </Col>
            </Row>
        </Form>
    );
}

export default DeleteOrg;