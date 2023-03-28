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

interface Orgs {
  OrganizationID: number,
  OrganizationName: string,
  Status: string
}

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
  const [orgs, setOrgs] = useState<Orgs[]>([]);

  // Gets user info from database
  useEffect(() => {
     fetch('http://localhost:3333/users/' + userID)
        .then((res) => res.json())
        .then((data) => {
          if(data.image == '') {
            data.image = 'https://team25-s3bucket.s3.amazonaws.com/Default-PFP.jpg'
          }
           setData({firstName:data.firstName, lastName:data.lastName, email:data.email, phone:data.phone, bio:data.bio, image:data.image})
        })
        .catch((err) => {
           console.log(err.message);
        });
        fetch(`http://localhost:3333/applications/driver?driverID=${userID}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
          credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
           setOrgs(data);
        })
        .catch((err) => {
           console.log(err.message);
        });
  }, []);

  var OrgsArray = [], PendingArray = [];
  orgs.map((org) => {
    if(org.Status === 'Employed') {
      OrgsArray.push({
        OrganizationID: org.OrganizationID,
        OrganizationName:org.OrganizationName,
        Status:org.Status
      })
    }
    else if(org.Status === 'Pending') {
      PendingArray.push({
        OrganizationID: org.OrganizationID,
        OrganizationName:org.OrganizationName,
        Status:org.Status
      })
    }
  }) 

  var index = 0;
  OrgsArray.map((org) => {
      if(index != OrgsArray.length - 1) {
        org.OrganizationName = org.OrganizationName + ', ';
      }
      index++;
  })



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
                  src={Data.image}
                  alt="avatar"
                  className="rounded-circle"
                  style={{ width: '150px' }}
                  fluid />
                <p className="text-muted mb-1">{Data.email}</p>
                <p className="text-muted mb-1">Affiliated Organizations:</p>
                <p className="text-muted mb-4"> {OrgsArray.map((org) => (
                  org.OrganizationName
                ))}</p>
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
              {PendingArray.map((org) => (
                <MDBCard className="mb-4 mb-md-0" key={org.OrganizationID}>
                    <MDBCardBody>
                    <MDBCardText className="mb-4"><span className="text-primary font-italic me-1">{org.OrganizationName}</span>Application Status</MDBCardText>
                    <MDBCardText className="mb-1" style={{ fontSize: '.77rem' }}>Completion Progress</MDBCardText>
                    <MDBProgress className="rounded">
                      <MDBProgressBar width={80} valuemin={0} valuemax={100} />
                    </MDBProgress>
                    <MDBCol sm="9">
                        <MDBCardText className="mb-1"><span className="text-primary font-italic me-1">Acceptance:</span> Pending</MDBCardText>
                    </MDBCol>
                  </MDBCardBody>
                </MDBCard>
              ))}
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