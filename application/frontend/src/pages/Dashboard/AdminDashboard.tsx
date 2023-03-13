import React from 'react'
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

const AdminDashboard = () =>{
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
                                    <a href="/catalog"> 
                                    <MDBCardImage src='https://www.shutterstock.com/image-photo/beautiful-landscape-ocean-summer-sunset-260nw-1513858394.jpg' fluid alt='...'/>
                                    </a>
                                </MDBCol>
                            </MDBRow>
                        </MDBCard>
                    </a>
                    <a href="/points-change" className='p-3 w-25' style={{ color: 'inherit', textDecoration: 'inherit'}}>
                        <MDBCard className='h-100' alignment='center'>
                                <MDBCardBody className='vstack gap-5'>
                                    <MDBCardTitle >Points History</MDBCardTitle>
                                    <a href="/PC1" style={{ color: 'inherit', textDecoration: 'inherit', }}>
                                        <MDBCardText>
                                            Points Change 1
                                        </MDBCardText>
                                    </a>
                                    <a href="/PC2" style={{ color: 'inherit', textDecoration: 'inherit'}}>
                                        <MDBCardText >
                                            Points Change 2
                                        </MDBCardText>
                                    </a>
                                    <a href="/PC3" style={{ color: 'inherit', textDecoration: 'inherit'}}>
                                        <MDBCardText >
                                            Points Change 3
                                        </MDBCardText>
                                    </a>
                                </MDBCardBody>
                        </MDBCard>   
                    </a>
                    <a href="/notifications" className='p-3 w-25' style={{ color: 'inherit', textDecoration: 'inherit'}}> 
                        <MDBCard className='h-100' alignment='center'>
                            <MDBCardBody className='vstack gap-5'>
                                <MDBCardTitle >Notifications</MDBCardTitle>
                                <a href="/noti1" style={{ color: 'inherit', textDecoration: 'inherit', }}>
                                    <MDBCardText >
                                        Notification 1
                                    </MDBCardText>
                                </a>
                                <a href="/noti2" style={{ color: 'inherit', textDecoration: 'inherit', }}>
                                    <MDBCardText >
                                        Notification 2
                                    </MDBCardText>
                                </a>
                                <a href="/noti3" style={{ color: 'inherit', textDecoration: 'inherit', }}>
                                    <MDBCardText >
                                        Notification 3
                                    </MDBCardText>
                                </a>
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
                                    <a href="/order1"> 
                                        <MDBCardImage src='https://www.shutterstock.com/image-photo/beautiful-landscape-ocean-summer-sunset-260nw-1513858394.jpg' fluid alt='...'/>
                                    </a>
                                </MDBCol>
                            </MDBRow>
                        </MDBCard>
                    </a>
                 </MDBCardGroup>
            </MDBRow>
            <MDBRow className='h-100'>
                <MDBCardGroup>
                    <a href="/driver-applications" className='p-3 w-25' style={{ color: 'inherit', textDecoration: 'inherit'}}>
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
                    <a href="/reports" className='p-3 w-25' style={{ color: 'inherit', textDecoration: 'inherit'}}> 
                        <MDBCard className='h-100' alignment='center'>
                            <MDBCardBody className='d-flex align-items-center justify-content-center'>
                                    <MDBCardTitle>Reports</MDBCardTitle>
                            </MDBCardBody>
                        </MDBCard>
                    </a>
                </MDBCardGroup>
            </MDBRow> 
        </section>
    )
}
export default AdminDashboard;