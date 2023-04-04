import react, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export interface SponsorApp {
    SponsorID: number,
    DriverID: number,
    Name: string,
    Status: string,
    ParentCallback: Function
}


const SponsorApp: React.FC<SponsorApp> = (props) => {
    const [accepted, setAccepted] = useState(true);
    const [reason, setReason] = useState("");

    const onSubmitHandler = (e) => {
        e.preventDefault();

        console.log(e.target)

        fetch(`http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/applications/sponsor?` +
            `sponsorID=${encodeURIComponent(props.SponsorID)}` +
            `&driverID=${encodeURIComponent(props.DriverID)}` +
            `&accepted=${encodeURIComponent(accepted)}` +
            `&reason=${encodeURIComponent(reason)}`
            , {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include",
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error submitting application decision")
                }

                props.ParentCallback()
            })
            .catch((err) => {
                console.log(err.message);
            });

        window.location.reload();
    }

    return (
        <tr>
            <th>{props.Name}</th>
            <th>{props.Status}</th>
            <th>
                {
                    props.Status === "Pending" ?
                        <>
                            <Form action="/applications/sponsor" onSubmit={onSubmitHandler}>
                                <Row>
                                    <Col>
                                        <Form.Check
                                            type="radio"
                                            label="Accept"
                                            name="decideapp"
                                            id="accepted"
                                            defaultChecked
                                            onChange={e => setAccepted(true)}
                                        />
                                        <Form.Check
                                            type="radio"
                                            label="Deny"
                                            name="decideapp"
                                            id="accepted"
                                            onChange={e => setAccepted(false)}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control name="reason" placeholder="Reason" required={true} onChange={e => setReason(e.target.value)} />
                                    </Col>
                                    <Col>
                                        <Button type="submit">Submit</Button>
                                    </Col>
                                </Row>
                            </Form>
                        </>
                        :
                        <></>
                }
            </th>
        </tr>
    )
}

export default SponsorApp;