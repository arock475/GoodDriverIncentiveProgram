import React from "react";
import { useState } from "react";
import { getUserClaims } from "../../utils/getUserClaims";
import { User } from "../../components/CreateUser/CreateUser";
import { Col, Form, Row } from "react-bootstrap";
import IndividualDriverReport from "../../components/Reports/IndividualDriver";
import AllDriver from "../../components/Reports/AllDriver";

const PointsReport = ({}) => {
    // claim: depreciated replace with viewAs later
    const [userClaim, setUserClaim] = useState(getUserClaims());

    // change view between driver
    const [showAllDrivers, setShowAllDrivers] = useState(true);
    const handleDriverViewChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowAllDrivers(event.target.value == 'all');
    }

    // html
    if (userClaim.role != User.Admin && userClaim.role != User.Sponsor) {
        return (
            <div>
                ERROR: Improper role for accessing this page!
            </div>
        );
    }
    else {
        return (
            <Form>
               <Col>
                    <Row>
                        <Form.Label>Select View</Form.Label>           
                        <Form.Control as='select' onChange={handleDriverViewChange}>
                            <option value='all'>All Drivers</option>
                            <option value='individual'>Individual Driver</option>
                        </Form.Control>
                    </Row>
                    <Row>
                        { showAllDrivers && 
                            <div>
                                <AllDriver/>
                            </div>
                        }
                        { !showAllDrivers &&
                            <div>
                                <IndividualDriverReport/>
                            </div>
                        }
                    </Row>
               </Col> 
            </Form>
        );
    }
}


export default PointsReport;