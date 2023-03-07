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
  MDBBtn,
  MDBInput,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
} from 'mdb-react-ui-kit';
import { useNavigate, useParams } from "react-router-dom";
import{ useState, useEffect, useRef} from 'react';
import AWS from 'aws-sdk';
import emailjs from 'emailjs-com';

AWS.config.update({
    accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY
})

const myBucket = new AWS.S3({
    params: { Bucket: process.env.REACT_APP_S3_BUCKET},
    region: process.env.REACT_APP_REGION,
})

export default function EditProfilePage() {
    const { userID } = useParams();
    const [Data,setData]=useState({
      email:'',
      firstName:'',
      lastName:'',
      phone:'',
      bio:'',
      image:''
    })

    // Gets user info from database
    useEffect(() => {
       fetch('http://localhost:3333/users/' + userID)
          .then((res) => res.json())
          .then((data) => {
             setData({email:data.email, firstName:data.firstName, lastName:data.lastName, phone:data.phone, bio:data.bio, image:data.image})
          })
          .catch((err) => {
             console.log(err.message);
          });
    }, []);

    const email = {      
      name: Data.firstName + ' ' + Data.lastName,
      email: Data.email
    }

    const form = useRef();
    function sendEmail(e) {
      e.preventDefault();   
      console.log(Data.email);
      emailjs.send(process.env.REACT_APP_SERVICE_ID, process.env.REACT_APP_TEMPLATE_ID, email, process.env.REACT_APP_EMAIL_USER_ID)
        .then((result) => {
            window.location.reload() 
        }, (error) => {
            console.log(error.text);
        });
        routeChange('reset')
    }

    // Updates Data struct when user changes a field
    const handleChange = (event) => {
      const value = event.target.value;
      setData({
        ...Data,
        [event.target.name]: value
      });
    }
    
    const [basicModal, setBasicModal] = useState(false);
    const toggleShow = () => setBasicModal(!basicModal);
    const [progress , setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);

    // Handle File input
    const handleFileInput = (e) => {
        setSelectedFile(e.target.files[0]);
        Data.image = process.env.REACT_APP_URL + e.target.files[0].name;
    }

    // Upload file to the S3 bucket
    const uploadFile = (file) => {
        const params = {
            ACL: 'public-read',
            Body: file,
            Bucket: process.env.REACT_APP_S3_BUCKET,
            Key: file.name,
            ContentType:'image/jpg',
            ContentDisposition:'inline', 
        };

        myBucket.putObject(params)
            .on('httpUploadProgress', (evt) => {
                setProgress(Math.round((evt.loaded / evt.total) * 100))
            })
            .send((err) => {
                if (err) console.log(err)
            })
    }

    // Send Data struct info to database
    const sendRequest = () => {
      console.log(Data.image);
      const requestOptions = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: userID,
            firstName: Data.firstName,
            lastName: Data.lastName,
            phone: Data.phone, 
            bio: Data.bio,
            image: Data.image
          })
      };
      fetch('http://localhost:3333/users/' + userID + '/profile', requestOptions)
          .then(response => response.json())
    };
    
    // Navigate back to the profile change after update
    let navigate = useNavigate(); 
    const routeChange = (path) =>{ 
      setTimeout(function () {
        navigate(path);
      }, 1000);
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
                <p className="text-muted mb-1">Company Name</p>
                <p className="text-muted mb-4">Organization Name</p>
              </MDBCardBody>
              <div className="d-grid gap-2 d-md-flex justify-content-md-start"><MDBBtn onClick={toggleShow}>Update Profile Picture</MDBBtn></div>
              <MDBModal show={basicModal} setShow={setBasicModal} tabIndex="-1">
                <MDBModalDialog>
                  <MDBModalContent>
                    <MDBModalHeader>
                      <MDBModalTitle>Upload Profile Picture</MDBModalTitle>
                      <MDBBtn
                        className="btn-close"
                        color="none"
                        onClick={toggleShow}
                      ></MDBBtn>
                    </MDBModalHeader>
                    <MDBModalBody>
                      <div>Native SDK File Upload Progress is {progress}%</div>
                      <input type="file" onChange={handleFileInput}/>
                      <button onClick={() => uploadFile(selectedFile)}> Upload Image</button>
                    </MDBModalBody>
                  </MDBModalContent>
                </MDBModalDialog>
              </MDBModal>
            </MDBCard>

            <MDBCard className="mb-4 mb-lg-0">
              <MDBCardBody className="p-0">
                  <MDBListGroupItem className="d-flex justify-content-between align-items-center p-3">
                    <MDBIcon fas icon="globe fa-lg text-warning" />
                    <MDBInput placeholder='Website Info1' id='typeText' type='text' />
                  </MDBListGroupItem>
                  <MDBListGroupItem className="d-flex justify-content-between align-items-center p-3">
                    <MDBIcon fab icon="github fa-lg" style={{ color: '#333333' }} />
                    <MDBInput placeholder='Website info 2' id='typeText' type='text' />
                  </MDBListGroupItem>
                  <MDBListGroupItem className="d-flex justify-content-between align-items-center p-3">
                    <MDBIcon fab icon="twitter fa-lg" style={{ color: '#55acee' }} />
                    <MDBInput placeholder='Etc.' id='typeText' type='text' />
                  </MDBListGroupItem>
                  <MDBListGroupItem className="d-flex justify-content-between align-items-center p-3">
                    <MDBIcon fab icon="instagram fa-lg" style={{ color: '#ac2bac' }} />
                    <MDBInput placeholder='' id='typeText' type='text' />
                  </MDBListGroupItem>
                  <MDBListGroupItem className="d-flex justify-content-between align-items-center p-3">
                    <MDBIcon fab icon="facebook fa-lg" style={{ color: '#3b5998' }} />
                    <MDBInput placeholder='' id='typeText' type='text' />
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
                    <MDBInput placeholder={Data.firstName} id='typeText' type='text' name="firstName" onChange={handleChange} />
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Last Name</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBInput placeholder={Data.lastName} id='typeText' type='text' name="lastName" onChange={handleChange}/>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Phone</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBInput placeholder={Data.phone} id='typeText' type='text' name="phone" onChange={handleChange}/>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Biography</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBInput placeholder={Data.bio}  id='typeText' type='text' name="bio" onChange={handleChange}/>
                    <MDBCardText className="text-muted"></MDBCardText>
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
          <div className="d-grid gap-2 d-md-flex justify-content-md-start"><MDBBtn onClick={function(event){ sendRequest(); routeChange('../')}}>
            Save Profile
          </MDBBtn></div>
          <div className="d-grid gap-2 d-md-flex justify-content-md-start"><MDBBtn onClick={function(event){ routeChange('../reset')}}>
              Reset Password
          </MDBBtn></div>
        </MDBRow>
    </section>
  );
}