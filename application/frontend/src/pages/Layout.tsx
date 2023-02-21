import React from 'react';
import { Outlet } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Header from '../components/Header/Header';
import Footer from '../components/FooterComponent'

export type LayoutProps = {

}

const Layout: React.FC<LayoutProps> = ({}) => {
    return (
        <>
            <Header colorTheme={"light"} loggedIn={false}/>
                <Container>
                    <Outlet/>
                </Container>
            <Footer colorTheme={"light"}/>
        </>
    )
}

export default Layout;