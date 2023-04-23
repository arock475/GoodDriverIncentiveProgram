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

const ProfileCard: React.FC<UserClaims> = ({ id }) => {
    return (
        <a href={`/user/${id}`} className='p-3 w-25' style={{ color: 'inherit', textDecoration: 'inherit'}}>
            <MDBCard className='h-100' alignment='center'>
                <MDBCardBody className='d-flex align-items-center justify-content-center'>
                    <MDBCardTitle>Profile</MDBCardTitle>
                </MDBCardBody>
            </MDBCard>   
        </a>
    )
}

export default ProfileCard;