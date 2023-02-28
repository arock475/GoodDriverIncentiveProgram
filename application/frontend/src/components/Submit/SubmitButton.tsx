import React from 'react';
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'

const SubmitButton = ({}) => {
    return (
        <Container>
            <Row>
                <Col class="text-center">
                    <Button variant="primary" type="submit">Submit</Button>
                </Col>
            </Row>           
        </Container>
    )
}

export default SubmitButton;