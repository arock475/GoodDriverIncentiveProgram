import React from 'react';
import { Outlet } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/FooterComponent'

export type LayoutProps = {
    colorTheme?: string
}

const Layout: React.FC<LayoutProps> = ({
    colorTheme="light"
}) => {
    return (
        <div className='d-flex flex-column' style={{minHeight: "100vh"}}>
            <Header colorTheme={colorTheme}/>
            
            <Container fluid className='flex-fill'>
                <Outlet/>
            </Container>`
            
            <Footer colorTheme={colorTheme}/>
        </div>
    )
}

export default Layout;