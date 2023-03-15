import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { useNavigate } from "react-router-dom";
import{ useState, useEffect } from 'react';
import Select from 'react-select';
import cellEditFactory from 'react-bootstrap-table2-editor';
import paginationFactory from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';

export default function CreateCategory() {
    interface User {
        id: number;
        driverID: number;
        first: string;
        last: string;
        full: string;
        email: string;
      }
      interface Point {
        ID:string,
        Name:string,
        Reason:string,
        NumChange:string,
        Catalog:string
      }
      
    const [users, setUsers] = useState<User[]>([]);
    const [user, setUser] = useState<User>();
    const [tableUsers, setTableUsers] = useState<User[]>([]);
    const [Points, setPoints] = useState<Point>();
    const [PointsArray, setPointsArray] = useState<Point[]>([]);
    const columns = [{
        dataField: 'name',
        text: 'Name'
        }, {
        dataField: 'description',
        text: 'Description'
        }, {
        dataField: 'points',
        text: 'Point Value'
        }];
      
    useEffect(() => {
        const fetchUsers = async () => {
            const resp = await fetch("http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/users");
            const data = await resp.json();

            const response = await fetch("http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/drivers");
            const drivers = await response.json();
        
            const users = data.map((user: any) => ({
                id: user.id,
                first: user.firstName,
                last: user.lastName,
                full: user.firstName + " " + user.lastName,
                email: user.email,
            }));
            setUsers(users);
            // Get all users that are drivers and set their driverID
            drivers.map((driver) => {
                users.map((user) => {
                    if(driver.UserID === user.id) {
                        user.driverID = driver.ID;
                        setTableUsers(tableUsers => [...tableUsers, user]);
                    }
                });
            });
        };
    
        fetchUsers();
        fetch('http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/points')
        .then((res) => res.json())
        .then((data) => {
            setPointsArray(data);
        })
        .catch((err) => {
            console.log(err.message);
        });
    }, []);

    var PointArray = []
    PointsArray.map((point) => {
        if(parseInt(point.Catalog) != 1) {
            PointArray.push({
            id: point.ID,
            name:point.Name,
            description:point.Reason,
            points:point.NumChange
            })
        }
    }) 
    
    const sendRequest = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              DriverID: user.driverID,
              OrganizationID: 1,
              NumChange: parseInt(Points.NumChange),
              Reason: Points.Reason, 
              Name: Points.Name,
              Catalog: parseInt(Points.Catalog)
            })
        };
        fetch('http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/points/create', requestOptions)
            .then(response => response.json())
            .catch((err) => {
                console.log(err.message);
             });
    };

    const handleChange = (event) => {
        users.map((user) => {
            if (event.value === user.full) {
                setUser(user);
            }
        });
    };

    const handleOnSelect = (row) => {
        let point = {
            ID: row.id,
            Name: row.name,
            Reason: row.description,
            NumChange: row.points,
            Catalog: "1"
        };
        setPoints(point);
    }
    

    let navigate = useNavigate(); 
    const routeChange = (path) =>{ 
      setTimeout(function () {
        navigate(path);
      }, 1000);
    }

    const selectRow = {
        mode: 'radio',
        clickToSelect: true,
        onSelect: handleOnSelect,
    };

    return (
        <div style={{ height: "100vh" }}>
        <Form>
            <Form.Group>
                <Form.Label><h3>1. Select Driver</h3></Form.Label>
                    <Select onChange={handleChange} options={
                        tableUsers.map((user) => (
                            { value: user.full, label: user.full}
                        ))} />
            </Form.Group>
            <hr></hr>
            <Form.Group>
                    <Form.Label><h3>2. Select Category</h3></Form.Label>
                        <BootstrapTable keyField='name' data = {PointArray} columns={ columns } selectRow={ selectRow } bordered={ false } striped hover condensed pagination={ paginationFactory() }/> 
            </Form.Group>
            <hr></hr>
            <Button onClick={function(event){ sendRequest(); routeChange('../')}}>Submit</Button>
        </Form>
    </div>
    )}