import React from 'react';
import '../styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import CreateAccount from '../pages/Login/CreateAccountComponent';
import Header from '../components/Header/Header';
import Faq from '../pages/FAQ/Faq';
import Footer from '../components/FooterComponent'

const App = () => {
  return (
    <div>
      <Header colorTheme={"light"} loggedIn={true} loginUser={"Van Scoy"}/>
        <CreateAccount/>
      <Footer colorTheme={"light"}/>
    </div>

  )
}


export default App;
