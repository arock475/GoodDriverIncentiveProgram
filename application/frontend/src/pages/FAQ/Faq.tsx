import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';

const Faq = ({}) => {
    return (
        <Container>
            <Stack>
            <div className="bg-light border">Question 1</div>
            <p> Answer 1</p>
            <div className="bg-light border">Question 2</div>
            <p> Answer 2</p>
            <div className="bg-light border">Question 3</div>
            <p> Answer 3</p>
            </Stack>
        </Container>

    );
}

export default Faq;