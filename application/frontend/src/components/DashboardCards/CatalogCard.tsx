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

const CatalogCard: React.FC<UserClaims> = ({ }) => {
    return (
        <a href="/catalog" className='p-3 w-25' style={{ color: 'inherit', textDecoration: 'inherit'}}>
            <MDBCard className='h-100' alignment='center'>
                <MDBCardBody>
                    <MDBCardTitle >Catalog</MDBCardTitle>
                </MDBCardBody>
            </MDBCard>
        </a>
    )
}

export default CatalogCard;