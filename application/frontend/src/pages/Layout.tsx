import React from 'react';
import { Outlet } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Header from '../components/Header/Header';
import Footer from '../components/FooterComponent'

export type LayoutProps = {
    loggedIn?: boolean,
    loginUser?: string,
    loginId?: number
}

const Layout: React.FC<LayoutProps> = ({
    loggedIn=false,
    loginUser="",
    loginId
}) => {
    return (
        <div className='d-flex flex-column' style={{minHeight: "100vh"}}>
            <Header colorTheme={"light"} loggedIn={loggedIn} loginUser={loginUser} loginId={loginId}/>
            
            <Container fluid className='flex-fill'>
                <Outlet/>
            </Container>`
            
            <Footer colorTheme={"light"}/>
        </div>
    )
}

export default Layout;