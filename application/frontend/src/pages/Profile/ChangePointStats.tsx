import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { getUserClaims } from '../../utils/getUserClaims';

export default function CreateCategory() {
    const [userClaims, setUserClaims] = useState(getUserClaims());
    const [sponsor, setSponsorData] = useState({
        ID: '',
        OrgID: '',
        PointsRatio: ''
    })

    useEffect(() => {
        fetch(`http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/sponsors/u:${userClaims.id}`)
            .then((res) => res.json())
            .then((data) => {
                setSponsorData({ ID: data.ID, OrgID: data.OrganizationID, PointsRatio: data.Organization.PointsRatio });
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, []);

    const handleChange = (event) => {
        const value = event.target.value;
        setSponsorData({
            ...sponsor,
            [event.target.name]: value
        });
    }

    const sendRequest = () => {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                PointsRatio: parseFloat(sponsor.PointsRatio)
            })
        };
        fetch('http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/orgs/' + sponsor.OrgID + '/stats', requestOptions)
    };

    // Navigates to the  profile page
    let navigate = useNavigate();
    const routeChange = (path) => {
        setTimeout(function () {
            navigate(path);
        }, 1000);
    }


    return (
        <><h3><b>Current Point Statistics</b></h3><hr></hr>
            <Form>
                <Form.Group>
                    <Form.Label><h4>Points Ratio</h4></Form.Label>&nbsp;&nbsp;&nbsp;
                    <Form.Label><p>This will multiple all points by this ratio for your organization</p></Form.Label><br></br>
                    <input type="text" placeholder={sponsor.PointsRatio} name="PointsRatio" onChange={handleChange} /><p></p>
                </Form.Group>
                <hr></hr>
                <Form.Group>
                    <Form.Label><h4>Points Minimum</h4></Form.Label>&nbsp;&nbsp;&nbsp;
                    <Form.Label><p>This will determine the number of points needed to be employed by your organization</p></Form.Label>
                </Form.Group>
                <hr></hr>
                <Form.Group>
                    <Form.Label><h4>Points Maximum</h4></Form.Label>&nbsp;&nbsp;&nbsp;
                    <Form.Label><p>This will determine the maximum number of points that can be allotted to a driver by your organization</p></Form.Label>
                </Form.Group>
                <hr></hr>
                <Button onClick={function (event) { sendRequest(); routeChange('../') }}>Submit</Button>
            </Form>
        </>
    )
}