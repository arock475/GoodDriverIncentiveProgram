import React from 'react';
import { Outlet } from "react-router-dom";
import Header from '../components/Header/Header';
import Footer from '../components/FooterComponent'

export type LayoutProps = {

}

const Layout: React.FC<LayoutProps> = ({}) => {
    return (
        <>
            <Header colorTheme={"light"} loggedIn={true} loginUser={"Van Scoy"}/>
            
            <Outlet/>
            
            <Footer colorTheme={"light"}/>
        </>
    )
}

export default Layout;