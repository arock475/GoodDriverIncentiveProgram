import {
  MDBBtn,
} from 'mdb-react-ui-kit';
import { useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import emailjs from 'emailjs-com';

export default function PasswordReset() {
  const { userID } = useParams();
  const [Data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })
  const password_token = Math.floor(Math.random() * 90000) + 10000

  const email = {
    name: Data.firstName + ' ' + Data.lastName,
    email: Data.email,
    token: password_token
  }
  // Gets user info from database
  useEffect(() => {
    fetch('http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/users/' + userID)
      .then((res) => res.json())
      .then((data) => {
        setData({ email: data.email, firstName: data.firstName, lastName: data.lastName })
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  function sendEmail(e) {
    e.preventDefault();
    emailjs.send(process.env.REACT_APP_SERVICE_ID, process.env.REACT_APP_TEMPLATE_ID, email, process.env.REACT_APP_EMAIL_USER_ID)
      .then((result) => {
      }, (error) => {
        console.log(error.text);
      });
  }


  return (
    <><p> Get a token from the email associated with this account and paste it below to reset your password: </p>
      <div className="d-grid gap-2 d-md-flex justify-content-md-start"><MDBBtn onClick={sendEmail}>
        Send Email
      </MDBBtn></div>
      <input type="text" onChange={(e) => {
        var value = '' + email.token;
        if (e.target.value == value) {
          console.log('Success!');
        }
      }} />
    </>
  )
}