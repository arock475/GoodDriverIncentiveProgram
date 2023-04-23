import React from 'react';
import {
    MDBCard,
    MDBCardBody,
    MDBCardTitle
  } from 'mdb-react-ui-kit';
import { UserClaims } from '../../utils/getUserClaims';

const ApplicationsCard: React.FC<UserClaims> = ({}) => {
    return (
        <a href="/applications" className='p-3 w-25' style={{ color: 'inherit', textDecoration: 'inherit'}}>
            <MDBCard className='h-100' alignment='center'>
                <MDBCardBody className='d-flex align-items-center justify-content-center'>
                    <MDBCardTitle >Applications</MDBCardTitle>
                </MDBCardBody>
            </MDBCard>
        </a>
    )
}

export default ApplicationsCard;