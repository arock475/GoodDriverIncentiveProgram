import React from 'react'
import Container from 'react-bootstrap/Container';
import Link from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
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

const DriverDashboard = () =>{
    return (
        <section className='bg-light'>
            <MDBRow className='h-50'>
                <MDBCardGroup>
                    <a href="/catalog" className='p-3 w-25' style={{ color: 'inherit', textDecoration: 'inherit'}}>
                        <MDBCard className='h-100' alignment='center'>
                            <MDBCardBody>
                                <MDBCardTitle >Catalog</MDBCardTitle>
                            </MDBCardBody>
                            <MDBRow>
                                <MDBCol>
                                    <MDBCardImage src='https://www.shutterstock.com/image-photo/beautiful-landscape-ocean-summer-sunset-260nw-1513858394.jpg' fluid alt='...'/>
                                </MDBCol>
                            </MDBRow>
                        </MDBCard>
                    </a>
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
                    <a href="/notifications" className='p-3 w-25' style={{ color: 'inherit', textDecoration: 'inherit'}}> 
                        <MDBCard className='h-100' alignment='center'>
                            <MDBCardBody className='vstack gap-5'>
                                <MDBCardTitle >Notifications</MDBCardTitle>
                                <div style={{ color: 'inherit', textDecoration: 'inherit', }}>
                                    <MDBCardText >
                                        Notification 1
                                    </MDBCardText>
                                </div>
                                <div style={{ color: 'inherit', textDecoration: 'inherit', }}>
                                    <MDBCardText >
                                        Notification 2
                                    </MDBCardText>
                                </div>
                                <div style={{ color: 'inherit', textDecoration: 'inherit', }}>
                                    <MDBCardText >
                                        Notification 3
                                    </MDBCardText>
                                </div>
                            </MDBCardBody>
                        </MDBCard>
                    </a>
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
                 </MDBCardGroup>
            </MDBRow>
            <MDBRow className='h-100'>
                <MDBCardGroup className='d-flex justify-content-center'>
                    <a href="/applications/driver" className='p-3 w-25' style={{ color: 'inherit', textDecoration: 'inherit'}}>
                        <MDBCard className='h-100' alignment='center'>
                            <MDBCardBody className='d-flex align-items-center justify-content-center'>
                                <MDBCardTitle >Applications</MDBCardTitle>
                            </MDBCardBody>
                        </MDBCard>
                    </a>
                    <a href="/user/:userID" className='p-3 w-25' style={{ color: 'inherit', textDecoration: 'inherit'}}>
                        <MDBCard className='h-100' alignment='center'>
                            <MDBCardBody className='d-flex align-items-center justify-content-center'>
                                <MDBCardTitle>Profile</MDBCardTitle>
                            </MDBCardBody>
                        </MDBCard>   
                    </a>
                    <a href="/organizations" className='p-3 w-25' style={{ color: 'inherit', textDecoration: 'inherit'}}> 
                        <MDBCard className='h-100' alignment='center'>
                            <MDBCardBody className='d-flex align-items-center justify-content-center'>
                                    <MDBCardTitle>Organizations</MDBCardTitle>
                            </MDBCardBody>
                        </MDBCard>
                    </a>
                </MDBCardGroup>
            </MDBRow> 
        </section>
    )
}
export default DriverDashboard;