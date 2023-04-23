import React from 'react';
import { Outlet } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/FooterComponent'

export type LayoutProps = {
    colorTheme?: string
    viewAs?: number
    setViewAs?: React.Dispatch<React.SetStateAction<number>>
}

const Layout: React.FC<LayoutProps> = ({
    colorTheme="light", viewAs, setViewAs
}) => {
    return (
        <div className='d-flex flex-column' style={{minHeight: "100vh"}}>
            <Header colorTheme={colorTheme} viewAs={viewAs} setViewAs={setViewAs}/>
            
            <Container fluid className='flex-fill'>
                <Row className="justify-content-md-center">
                    <Col lg={8}>
                        <Outlet/>
                    </Col>
                </Row>
            </Container>
            
            <Footer colorTheme={colorTheme}/>
        </div>
    )
}

export default Layout;