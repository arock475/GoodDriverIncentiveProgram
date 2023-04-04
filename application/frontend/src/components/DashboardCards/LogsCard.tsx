import React from 'react';
import {
    MDBCard,
    MDBCardBody,
    MDBCardTitle
  } from 'mdb-react-ui-kit';
import { UserClaims } from '../../utils/getUserClaims';

const LogsCard: React.FC<UserClaims> = ({}) => {
    return (
        <a href="/logs" className='p-3 w-25' style={{ color: 'inherit', textDecoration: 'inherit'}}> 
        <MDBCard className='h-100' alignment='center'>
            <MDBCardBody className='d-flex align-items-center justify-content-center'>
                    <MDBCardTitle>Logs</MDBCardTitle>
            </MDBCardBody>
        </MDBCard>
    </a>
    )
}

export default LogsCard;