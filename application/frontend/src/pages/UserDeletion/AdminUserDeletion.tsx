import { useEffect, useState } from 'react';
import { Button, Col, Form, ListGroup, Row, Table } from 'react-bootstrap';
import { getUserClaims } from '../../utils/getUserClaims';
import { User } from '../../components/CreateUser/CreateUser';


interface UserInfo {
    id: number
    firstName: string
    lastName: string
    email: string
    type: number
}

export type ViewAsProps = {
    viewAs?: number
    setViewAs?: React.Dispatch<React.SetStateAction<number>>
}

const AdminUserDeletion: React.FC<ViewAsProps> = ({viewAs, setViewAs}) => {
    // claim
    const [userClaims, setUserClaims] = useState(getUserClaims()); 
    // creating user data to receive data from database
    const [users, setUsers] = useState<UserInfo[]>([])
    const [selectedUser, setSelectedUser] = useState<UserInfo>({
        id: -1,
        firstName: ' ',
        lastName: ' ',
        email: ' ',
        type: -1
    })

    const handleSubmit = async (even: React.SyntheticEvent) => {
        console.log(selectedUser);
        // making call to api
        const response = await fetch(`http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/users/${selectedUser.id}`, {
            method: 'DELETE'
        }).then(response => {
            if (response.status >= 200 && response.status < 300) {
                const resubmit = (userClaims.role == User.Admin || viewAs == User.Admin) ? window.confirm('Do you want to delete another user?') : false;   
                if (resubmit) {
                    window.location.href = '/delete-user';
                }
                else {
                    window.location.href = '/'
                }
            }
        })
        .catch(error => console.log(error));
    }

    // populating list of users
    useEffect(() => {
        // Fetch names from API and update state
        const fetchUsers = async () => {
          const response = await fetch('http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/users/');
          const data = await response.json();
          setUsers(data);
        };
        fetchUsers();
      }, []);
      
    // keeping track of which user is selected
    const handleUserChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const userID: number = parseInt(event.target.value);
        setSelectedUser(users.find((user) => user.id == userID));
    }

    // converts user type into text
    const typeToString = (type: number) => {
        switch (type) {
            case 0:
                return 'Driver';
            case 1:
                return 'Sponsor';
            case 2:
                return 'Admin';
            default:
                return 'Generic User';
        }
    }
    if (userClaims.role == User.Admin || viewAs == User.Admin) {
        return (
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col>                    
                        <Form.Group>
                            <Form.Label>Users</Form.Label>
                            <Form.Control as='select' onChange={handleUserChange}>
                                <option value="">Select a User</option>
                                {
                                    users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {`ID: ${user.id} Name: "${user.firstName} ${user.lastName}" Email: ${user.email} Type: ${typeToString(user.type)}`}
                                        </option>
                                    ))
                                }
                            </Form.Control>
                            <Form.Text>Select a user to delete.</Form.Text>
                        </Form.Group>
                    </Col>
                </Row>   
                <Row>
                    <Col className="text-center">
                        <Button type='submit' onSubmit={handleSubmit}>Submit</Button>
                    </Col>
                </Row>
            </Form>
        );
    } else {
        return (
          <div>ERROR! Improper role for accessing this page!</div>  
        );
    }
}

export default AdminUserDeletion;