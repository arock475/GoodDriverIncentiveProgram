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

const OrdersCard: React.FC<UserClaims> = ({}) => {
    return (
        <a href="/orders" className='p-3 w-25' style={{ color: 'inherit', textDecoration: 'inherit'}}>
            <MDBCard className='h-100' alignment='center'>
                <MDBCardBody>
                    <MDBCardTitle >Orders</MDBCardTitle>
                </MDBCardBody>
                <MDBRow>
                    <MDBCol>
                        <MDBCardImage src='https://www.shutterstock.com/image-photo/beautiful-landscape-ocean-summer-sunset-260nw-1513858394.jpg' fluid alt='...'/>
                    </MDBCol>
                </MDBRow>
            </MDBCard>
        </a>
    )
}

export default OrdersCard;