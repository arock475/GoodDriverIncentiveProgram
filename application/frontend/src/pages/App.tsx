import React from 'react';
import '../styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../components/Header/Header';

const App = () => {
  return (
    <Header colorTheme={"light"} loggedIn={true} loginUser={"Van Scoy"}/>

    
    // Page Contents
    
    // <FooterComponent></FooterComponent>
  )
}

export default App;
