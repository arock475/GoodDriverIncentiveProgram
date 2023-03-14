import BootstrapTable from 'react-bootstrap-table-next';
import { Button } from 'react-bootstrap';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { useNavigate} from "react-router-dom";
import{ useState, useEffect } from 'react';
import cellEditFactory from 'react-bootstrap-table2-editor';

interface Point {
  ID:string,
  Name:string,
  Reason:string,
  NumChange:string,
  Catalog:string
}

export default function PointManagment() {
  const [PointsArray, setPointsArray] = useState<Point[]>([])

  useEffect(() => {
    fetch('http://localhost:3333/points')
      .then((res) => res.json())
      .then((data) => {
          setPointsArray(data);
      })
      .catch((err) => {
          console.log(err.message);
      });
  }, []);


  // Set up table rows for each point
  var PointArray = []
  PointsArray.map((point) => {
    if(parseInt(point.Catalog) != 1) {
      PointArray.push({
        id: point.ID,
        name:point.Name,
        description:point.Reason,
        points:point.NumChange
      })
    }
  }) 

  // Set up table columns
  const columns = [{
    dataField: 'name',
    text: 'Name'
  }, {
    dataField: 'description',
    text: 'Description'
  }, {
    dataField: 'points',
    text: 'Point Value'
  }];

  let navigate = useNavigate(); 
  const routeChange = (path) =>{ 
    setTimeout(function () {
      navigate(path);
    }, 1000);
  }

  // Function saves table edits to
  function beforeSaveCell(oldValue, newValue, row, column, done) {
    setTimeout(() => {
      if (window.confirm('Do you want to accept this change?')) {
        var reasonEdit, numChangeEdit, id;
        // Get edit and post to database
        for (let i = 0; i < PointArray.length; i++) {
          if(PointArray[i].name == row.name) {
            id = PointArray[i].id;
            if(column.dataField === 'description') {
              reasonEdit = newValue;
              numChangeEdit = PointArray[i].NumChange;
            }
            else if(column.dataField === 'points') {
              numChangeEdit = parseInt(newValue);
              reasonEdit = PointArray[i].Reason;
            }
          }
        }
        const requestOptions = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ID: id,
            DriverID: 3,
            OrganizationID: 1,
            NumChange: numChangeEdit,
            Reason: reasonEdit, 
            Name: row.name,
            Catalog: 0
          })
        };
        fetch('http://localhost:3333/points', requestOptions)
          .then(response => response.json())
        done(true);
      } else {
        done(false);
      }
    }, 0);
    return { async: true };
  }
      
      
return (
  <>
  <h3>Point Catalog</h3>
  <div style={{ textAlign: 'right' }}>
    <Button onClick={function(event){ routeChange('create')}}>Create Category</Button>&nbsp;&nbsp;&nbsp; 
    <Button>Delete Category</Button>&nbsp;&nbsp;&nbsp; 
    </div>
  <BootstrapTable keyField='name' data = {PointArray} columns={ columns } cellEdit={ cellEditFactory({ mode: 'dbclick', beforeSaveCell })} bordered={ false } striped hover condensed pagination={ paginationFactory() }/>  
  <div style={{ textAlign: 'right' }}>
    <Button onClick={function(event){ routeChange('add')}}>Add Points to Driver</Button>
  </div>
  </>
)}