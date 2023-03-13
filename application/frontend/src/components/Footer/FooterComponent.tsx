import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';

export type FooterProps = {
    colorTheme: string
}

const Footer: React.FC<FooterProps> = ({


}) => {
    return (
        <div style={{backgroundColor: '#1E1E1E', color: 'white'}}>
            <Container>
                <Row>
                    <Col>
                        <h4>
                            About
                        </h4>
                        <ul className="list-unstyled">   
                            <li>
                                Our Goal
                            </li>                         
                            <li>
                                <a className="text-reset" href="/faq">Frequently Asked Questions</a>
                            </li>
                            <li>
                                &copy; {new Date().getFullYear()} TDIP. All Rights Reserved
                            </li>
                        </ul>
                    </Col>
                    <Col>
                        <h4>
                            Contact Us
                        </h4>
                        <ul className="list-unstyled">
                            <li> tdip.help@tdip.com </li>
                            <li> 1-800-TDIP-000 </li>
                            <li> Advertising </li>
                        </ul>
                    </Col>
                    <Col>
                        <h4>
                            Apply
                        </h4>
                        <ul className="list-unstyled">
                            <li> Drivers </li>
                            <li> Organizations </li>
                            <li> Job Opportunities </li>
                        </ul>
                    </Col>
                </Row>
                <Row className='text-center'>
                    <div className="text-xs-center">
                        
                    </div>
                </Row>
            </Container>
        </div>          
    )
}

export default Footer;