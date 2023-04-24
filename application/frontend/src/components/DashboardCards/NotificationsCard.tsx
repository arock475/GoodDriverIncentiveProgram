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

const NotificationsCard: React.FC<UserClaims> = ({}) => {
    return (
        <a href="/notifications" className='p-3 w-25' style={{ color: 'inherit', textDecoration: 'inherit'}}> 
            <MDBCard className='h-100' alignment='center'>
                <MDBCardBody className='vstack gap-5'>
                    <MDBCardTitle >Notifications</MDBCardTitle>
                </MDBCardBody>
            </MDBCard>
        </a>
    )
}

export default NotificationsCard;