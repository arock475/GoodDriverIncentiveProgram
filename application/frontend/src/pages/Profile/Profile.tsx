import {
  MDBCol,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBProgress,
  MDBProgressBar,
  MDBIcon,
  MDBListGroupItem,
  MDBBtn
} from 'mdb-react-ui-kit';
import { useNavigate, useParams } from "react-router-dom";
import{ useState, useEffect } from 'react';
import defaultpfp from '../../assets/default-pfp.jpg'

export default function ProfilePage() {
  const { userID } = useParams();
  const [Data,setData]=useState({
    firstName:'',
    lastName:'',
    email:'',
    phone:'',
    bio:'',
    image: ''
  })

  // Gets user info from database
  useEffect(() => {
     fetch('http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/users/' + userID)
        .then((res) => res.json())
        .then((data) => {
           setData({firstName:data.firstName, lastName:data.lastName, email:data.email, phone:data.phone, bio:data.bio, image:data.image})
        })
        .catch((err) => {
           console.log(err.message);
        });
  }, []);

  // Navigates to the Edit profile page
  let navigate = useNavigate(); 
  const routeChange = () =>{ 
    let path = 'edit'; 
    navigate(path);
  }

  return (
    <section style={{ backgroundColor: '#eee' }}>
        <MDBRow>
          <MDBCol lg="4">
            <MDBCard className="mb-4">
              <MDBCardBody className="text-center">
                <MDBCardImage
                  src={Data.image ? Data.image : defaultpfp}
                  alt="avatar"
                  className="rounded-circle"
                  style={{ width: '150px' }}
                  fluid />
                <p className="text-muted mb-1">{Data.email}</p>
                <p className="text-muted mb-1">Company Name</p>
                <p className="text-muted mb-4">Organization Name</p>
              </MDBCardBody>
            </MDBCard>

            <MDBCard className="mb-4 mb-lg-0">
              <MDBCardBody className="p-0">
                  <MDBListGroupItem className="d-flex justify-content-between align-items-center p-3">
                    <MDBIcon fas icon="globe fa-lg text-warning" />
                    <MDBCardText>Website info 1</MDBCardText>
                  </MDBListGroupItem>
                  <MDBListGroupItem className="d-flex justify-content-between align-items-center p-3">
                    <MDBIcon fab icon="github fa-lg" style={{ color: '#333333' }} />
                    <MDBCardText>Website info 2</MDBCardText>
                  </MDBListGroupItem>
                  <MDBListGroupItem className="d-flex justify-content-between align-items-center p-3">
                    <MDBIcon fab icon="twitter fa-lg" style={{ color: '#55acee' }} />
                    <MDBCardText>Etc.</MDBCardText>
                  </MDBListGroupItem>
                  <MDBListGroupItem className="d-flex justify-content-between align-items-center p-3">
                    <MDBIcon fab icon="instagram fa-lg" style={{ color: '#ac2bac' }} />
                    <MDBCardText></MDBCardText>
                  </MDBListGroupItem>
                  <MDBListGroupItem className="d-flex justify-content-between align-items-center p-3">
                    <MDBIcon fab icon="facebook fa-lg" style={{ color: '#3b5998' }} />
                    <MDBCardText></MDBCardText>
                  </MDBListGroupItem>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol lg="8">
            <MDBCard className="mb-4">
              <MDBCardBody>
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>First Name</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">{Data.firstName}</MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Last Name</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">{Data.lastName}</MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Phone</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">{Data.phone}</MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Biography</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">{Data.bio}</MDBCardText>
                  </MDBCol>
                </MDBRow>
              </MDBCardBody>
            </MDBCard>

            <MDBRow>
              <MDBCol md="6">
                <MDBCard className="mb-4 mb-md-0">
                  <MDBCardBody>
                    <MDBCardText className="mb-4"><span className="text-primary font-italic me-1">Driver</span> Application Status</MDBCardText>
                    <MDBCardText className="mb-1" style={{ fontSize: '.77rem' }}>Completion Progress</MDBCardText>
                    <MDBProgress className="rounded">
                      <MDBProgressBar width={80} valuemin={0} valuemax={100} />
                    </MDBProgress>
                    <MDBCol sm="9">
                        <MDBCardText className="mb-1"><span className="text-primary font-italic me-1">Acceptance:</span> Pending</MDBCardText>
                    </MDBCol>
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>
            </MDBRow>

          </MDBCol>
          <p></p><p></p>
          <div className="d-grid gap-2 d-md-flex justify-content-md-start"><MDBBtn onClick={routeChange}>
            Edit Profile
          </MDBBtn></div>
        </MDBRow>
    </section>
  );
}