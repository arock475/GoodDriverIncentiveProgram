import React from 'react';
import {
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBCardImage,
    MDBRow,
    MDBCol,
    MDBCardGroup
  } from 'mdb-react-ui-kit';
import { UserClaims } from '../../utils/getUserClaims';

const PointsHistoryCard: React.FC<UserClaims> = ({}) => {
    return (
        <a href="/points-change" className='p-3 w-25' style={{ color: 'inherit', textDecoration: 'inherit'}}>
            <MDBCard className='h-100' alignment='center'>
                    <MDBCardBody className='vstack gap-5'>
                        <MDBCardTitle >Points History</MDBCardTitle>
                        <div style={{ color: 'inherit', textDecoration: 'inherit', }}>
                            <MDBCardText>
                                Points Change 1
                            </MDBCardText>
                        </div>
                        <div style={{ color: 'inherit', textDecoration: 'inherit'}}>
                            <MDBCardText>
                                Points Change 2
                            </MDBCardText>
                        </div>
                        <div style={{ color: 'inherit', textDecoration: 'inherit'}}>
                            <MDBCardText>
                                Points Change 3
                            </MDBCardText>
                        </div>
                    </MDBCardBody>
            </MDBCard>   
        </a>
    )
}

export default PointsHistoryCard;