import React from 'react';
import '../styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import HeaderComponent from '../components/HeaderComponent';

const App = () => {
  return (
    <HeaderComponent colorTheme={"primary"} loggedIn={false} profilePictureUrl={''}/>
    
    // Page Contents
    
    // <FooterComponent></FooterComponent>
  )
}

export default App;
