import { useEffect, useState } from "react";
import { Accordion, Button, Card, Col, Container, Row } from "react-bootstrap";
import { useParams } from 'react-router-dom';

export interface Organization {
    ID: number
    Name: string
    Biography: string
    Phone: string
    Email: string
    LogoURL: string
}

const Organization = ({ }) => {
    // org variables
    const { orgid } = useParams<{ orgid: string }>();
    const [org, setOrg] = useState<Organization | null>(null)

    // on load
    useEffect(() => {
        // get org
        const fetchOrg = async () => {
            try {
                const response = await fetch(`http://http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/orgs/${orgid}`);
                const data = await response.json();
                setOrg(data);
            }
            catch (error) {
                console.log(`Error in fetching org: ${error}`);
            }
        }
        fetchOrg();
    }, []);

    if (org) {
        return (
            <div>
                {org.LogoURL &&
                    <div className="jumbotron">
                        <img src={org.LogoURL} alt="Banner Image" className="img-fluid" />
                    </div>
                }
                <Container>
                    <h1 className="display-3">{org.Name}</h1>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>About Us</Accordion.Header>
                            <Accordion.Body>{org.Biography}</Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Contact Us</Accordion.Header>
                            {(org.Email && org.Email != '') && <Accordion.Body>{`email:\t${org.Email}`}</Accordion.Body>}
                            {(org.Phone && org.Phone != '') && <Accordion.Body>{`phone:\t${org.Phone}`}</Accordion.Body>}
                        </Accordion.Item>
                    </Accordion>
                </Container>
            </div>
        );
    }
    else {
        return (
            <Container>
                <p>
                    Error Loading Page...
                </p>
            </Container>
        );
    }

}

export default Organization;