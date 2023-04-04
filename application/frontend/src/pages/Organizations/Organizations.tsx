import { useState, useEffect } from "react";
import { Button, Card, Container } from "react-bootstrap";
import { useParams } from "react-router";

{/* <Card style={{ width: '18rem' }}>
                    { org.LogoURL != null && <Card.Img variant="top" src={org.LogoURL} /> } 
                    <Card.Body>
                        
                        <Card.Title>{org.Name}</Card.Title>
                        { (org.Biography && org.Biography != '') && <Card.Text>{org.Biography}</Card.Text> }
                        <Button variant="primary">Go somewhere</Button>
                    </Card.Body>
                </Card> */}

type Organization = {
    ID: number
    Name: string
    Biography: string
    Phone: string
    Email: string
    LogoURL: string
}

const Organizations = ({ }) => {
    // org variables
    const [orgs, setOrgs] = useState<Organization[]>([])

    // on load
    useEffect(() => {
        // get org
        const fetchOrg = async () => {
            try {
                const response = await fetch(`http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/orgs`);
                const data = await response.json();
                setOrgs(data);
            }
            catch (error) {
                console.log(`Error in fetching orgs: ${error}`);
            }
        }
        fetchOrg();
    }, []);

    const visitClicked = (event) => {
        window.location.href = `/orgs/${event.target.value}`
    }

    return (
        <Container>
            {
                orgs.map((org) => (
                    <Card >
                        {org.LogoURL != null && <Card.Img variant="top" src={org.LogoURL} />}
                        <Card.Body>
                            <Card.Title>{org.Name}</Card.Title>
                            {(org.Biography && org.Biography != '') && <Card.Text>{org.Biography}</Card.Text>}
                            <Button variant="primary" value={org.ID} onClick={visitClicked}>Visit Page</Button>
                        </Card.Body>
                    </Card>
                ))
            }
        </Container>
    );
}

export default Organizations;