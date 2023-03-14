import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { useNavigate } from "react-router-dom";
import { useState } from 'react';

export default function CreateCategory() {
  const [Points, setPoints] = useState({
    Name: '',
    Reason: '',
    NumChange: ''
  })

  const sendRequest = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        DriverID: 1,
        OrganizationID: 1,
        NumChange: parseInt(Points.NumChange),
        Reason: Points.Reason,
        Name: Points.Name,
        Catalog: 0
      })
    };
    fetch('http://localhost:3333/points/create', requestOptions)
      .then(response => response.json())
      .catch((err) => {
        console.log(err.message);
      });
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setPoints({
      ...Points,
      [event.target.name]: value
    });
  }

  let navigate = useNavigate();
  const routeChange = (path) => {
    setTimeout(function () {
      navigate(path);
    }, 1000);
  }

  return (
    <div style={{ height: "100vh" }}>
      <Form>
        <Form.Group>
          <Form.Label>Category Name</Form.Label>
          <Form.Control name="Name" placeholder="Name" onChange={handleChange} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control name="Reason" placeholder="Example description" onChange={handleChange} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Point Value</Form.Label>
          <Form.Control name="NumChange" placeholder="0" onChange={handleChange} />
        </Form.Group>
        <hr></hr>
        <Button onClick={function (event) { sendRequest(); routeChange('../') }}>Add Category</Button>
      </Form>
    </div>
  )
};