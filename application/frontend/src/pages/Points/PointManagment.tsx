import BootstrapTable from 'react-bootstrap-table-next';
import { Button } from 'react-bootstrap';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { getUserClaims } from '../../utils/getUserClaims';

interface PointCategory {
  ID: string,
  Name: string,
  NumChange: string,
  Description: string,
}

export default function PointManagment() {
  const [PointsArray, setPointsArray] = useState<PointCategory[]>([])
  const [userClaims, setUserClaims] = useState(getUserClaims());
  const [PointsRatio, setPointsRatio] = useState({
    PointsRatio: 1
  })
  useEffect(() => {
    fetch(`http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/points/category`)
      .then((res) => res.json())
      .then((data) => {
        setPointsArray(data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  useEffect(() => {
    if (userClaims.role != 0) {
      fetch(`http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/sponsors/u:${userClaims.id}`)
        .then((res) => res.json())
        .then((data) => {
          setPointsRatio({ PointsRatio: data.Organization.PointsRatio })
        })
        .catch((err) => {
          console.log(err.message);
        });
    } else {
      fetch(`http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/drivers/u:${userClaims.id}`)
        .then((res) => res.json())
        .then((data) => {
          setPointsRatio({ PointsRatio: data.Organization.PointsRatio })
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  }, []);

  // Set up table rows for each point
  var PointArray = []
  PointsArray.map((point) => {
    var pointsNum = parseInt(point.NumChange) * PointsRatio.PointsRatio;
    PointArray.push({
      id: point.ID,
      name: point.Name,
      description: point.Description,
      points: pointsNum
    })
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
  const routeChange = (path) => {
    setTimeout(function () {
      navigate(path);
    }, 1000);
  }

  // Function saves table edits to
  function beforeSaveCell(oldValue, newValue, row, column, done) {
    if (userClaims.role != 0) {
      setTimeout(() => {
        if (window.confirm('Do you want to accept this change?')) {
          var reasonEdit, numChangeEdit, id;
          // Get edit and post to database
          for (let i = 0; i < PointArray.length; i++) {
            if (PointArray[i].name == row.name) {
              id = PointArray[i].id;
              if (column.dataField === 'description') {
                reasonEdit = newValue;
                numChangeEdit = PointArray[i].NumChange;
              }
              else if (column.dataField === 'points') {
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
              NumChange: numChangeEdit,
              Description: reasonEdit,
              Name: row.name,
            })
          };
          fetch('http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/points/category', requestOptions)
            .then(response => response.json())
          done(true);
          window.location.reload();
        } else {
          done(false);
        }
      }, 0);
      return { async: true };
    }
  }


  return (
    <>
      <h3>Point Catalog</h3> {userClaims.role != 0 && <p>Point Ratio: {PointsRatio.PointsRatio}</p>}
      <div style={{ textAlign: 'right' }}>
        {userClaims.role != 0 && <Button onClick={function (event) { routeChange('create') }}>Create Category</Button>}&nbsp;&nbsp;&nbsp;
        {userClaims.role != 0 && <Button>Delete Category</Button>}&nbsp;&nbsp;&nbsp;
      </div>
      <BootstrapTable keyField='name' data={PointArray} columns={columns} cellEdit={cellEditFactory({ mode: 'dbclick', beforeSaveCell })} bordered={false} striped hover condensed pagination={paginationFactory()} />
      <div style={{ textAlign: 'right' }}>
        {userClaims.role != 0 && <Button onClick={function (event) { routeChange('stats') }}>Change Point Statistics</Button>}&nbsp;&nbsp;&nbsp;
        {userClaims.role != 0 && <Button onClick={function (event) { routeChange('add') }}>Add Points to Driver</Button>}
      </div>
    </>
  )
}