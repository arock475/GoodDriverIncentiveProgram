import { useEffect, useState } from "react";
import { Accordion, Button, Card, Col, Container, Row } from "react-bootstrap";
import { useParams } from 'react-router-dom';
import {
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
} from 'mdb-react-ui-kit';
import SearchSelect from "../../components/Search/SearchSelect";
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
    const [basicModal, setBasicModal] = useState(false);
    const toggleShow = () => setBasicModal(!basicModal);
    const [userID, setUserID] = useState(-1);
    // on load
    useEffect(() => {
        // get org
        const fetchOrg = async () => {
            try {
                const response = await fetch(`http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/orgs/${orgid}`);
                const data = await response.json();
                setOrg(data);
            }
            catch (error) {
                console.log(`Error in fetching org: ${error}`);
            }
        }
        fetchOrg();
    }, []);

    const sendRequest = () => {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                driverID: userID,
                orgId: org.ID
            })
        };
        fetch('http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/orgs/' + org.ID + '/addToOrg', requestOptions)
            .then(response => response.json())
    };

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
                    <div className="d-grid gap-2 d-md-flex justify-content-md-center"><Button onClick={toggleShow}>Add User to Organization</Button></div>
                    <MDBModal class="modal fade" show={basicModal} setShow={setBasicModal} tabIndex="-1">
                        <MDBModalDialog>
                            <MDBModalContent>
                                <MDBModalHeader>
                                    <MDBModalTitle>Search for the user you wish to add</MDBModalTitle>
                                </MDBModalHeader>
                                <SearchSelect UserID={userID} setUserID={setUserID} />
                                <Button onClick={sendRequest}>Add Selected User</Button>
                            </MDBModalContent>
                        </MDBModalDialog>
                    </MDBModal>
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