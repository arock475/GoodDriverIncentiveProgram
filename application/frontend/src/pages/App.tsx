import React from 'react';
import '../styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import CreateAccount from '../pages/Login/CreateAccountComponent';
import Header from '../components/Header/Header';
<<<<<<< HEAD
import Faq from '../pages/FAQ/Faq';
=======
import Footer from '../components/FooterComponent'
>>>>>>> main

const App = () => {
  return (
    <div>
<<<<<<< HEAD
      <Header colorTheme={"light"} loggedIn={true} loginUser={"Van Scoy"}/>
      <Faq/>
=======
          <Header colorTheme={"light"} loggedIn={true} loginUser={"Van Scoy"}/>
            <CreateAccount/>
          <Footer colorTheme={"light"}/>
>>>>>>> main
    </div>

  )
}


export default App;
