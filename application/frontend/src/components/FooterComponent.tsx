import React from 'react';
import Container from 'react-bootstrap/Container';

export type FooterProps = {
    colorTheme: string
}

const Footer: React.FC<FooterProps> = ({
    colorTheme="dark"
}) => {
    return (
        <div className="main-footer">
            <div className="bg-dark text-white">
                <Container>
                    <div className="row">
                        <div className="col-md-3 col-sm">
                            <h4>
                                Links
                            </h4>
                            <ul className="list-unstyled">                            
                                <p>
                                    <a className="text-reset" href="https://www.youtube.com/watch?v=eow125xV5-c!">Frequently Asked Questions</a>
                                </p>
                            </ul>
                        </div>
                        <div className="col-md-3 col-sm">
                            <h4>
                                Test Text
                            </h4>
                            <ul className="list-unstyled">
                                <li> Test Text </li>
                            </ul>
                        </div>
                        <div className="col-md-3 col-sm">
                            <h4>
                                Test Text
                            </h4>
                            <ul className="list-unstyled">
                                <li> Test Text </li>
                            </ul>
                        </div>
                        <div className="col-md-3 col-sm">
                            <h4>
                                Test Text
                            </h4>
                            <ul className="list-unstyled">
                                <li> Test Text </li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p className="text-xs-center">
                            &copy; {new Date().getFullYear()} TDIP. All Rights Reserved
                        </p>
                    </div>
                </Container>
            </div>            
        </div>
    )
}

export default Footer;