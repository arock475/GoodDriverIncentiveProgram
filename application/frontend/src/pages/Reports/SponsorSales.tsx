import React from "react";
import { useState } from "react";
import { getUserClaims } from "../../utils/getUserClaims";
import { User } from "../../components/CreateUser/CreateUser";
import { Col, Form, Row } from "react-bootstrap";
import IndividualSponsor from "../../components/Reports/IndividualSponsor";
import MultipleSponsors from "../../components/Reports/MultipleSponsors";
import SelectSponsor from "../../components/Reports/SelectSponsor";

export default function SponsorSales () {

    // change view between driver
    const [showAllSponsors, setShowAllSponsors] = useState(true);
    const handleDriverViewChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowAllSponsors(event.target.value == 'all');
    }
    const [userClaim, setUserClaim] = useState(getUserClaims());

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
               {userClaim.role == User.Admin && <div>
                    <Row>
                        <Form.Label>Select View</Form.Label>           
                        <Form.Control as='select' onChange={handleDriverViewChange}>
                            <option value='all'>All Sponsors</option>
                            <option value='individual'>Individual Sponsor</option>
                        </Form.Control>
                    </Row>
                    { showAllSponsors && 
                        <Row>
                            <MultipleSponsors/>
                         </Row>
                    }
                    { !showAllSponsors && 
                        <Row>
                            <SelectSponsor/>
                        </Row>
                    }
                </div>
                }
            {userClaim.role == User.Sponsor && <div>
                    <Row>
                        <IndividualSponsor/>
                    </Row>
                </div>
            }
            </Col> 
            </Form>
        );
    }
}
