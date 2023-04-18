import { rmSync } from 'fs';
import React, { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import { CSVLink, CSVDownload } from "react-csv";



const IndividualDriverReport: React.FC<{}> = () => {
    const [driverIDList, setDriverIDList] = useState([])
    const [selectedIDs, setSelectedIDs] = useState([])
    const [pointHistoryList, setPointHistoryList] = useState([])
    const [table, setTable] = useState([])

    useEffect(() => {
        fetch(`http://localhost:3333/drivers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include"
        }).then(async response => {
            const data = await response.json()

            const driverIDs = [];

            data.forEach(item => {
                driverIDs.push(item.ID)
            })

            setDriverIDList(driverIDs)

            setSelectedIDs(driverIDs)
        }).catch()
    }, [])

    useEffect(() => {
        const fetchReports = async () => {
            const promises = await Promise.all(selectedIDs.map(ID => 
                fetch(`http://localhost:3333/reports/individual/${ID}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: "include",
                })
            ))

            const reports = await Promise.all(promises.map(x => x.json()))

            setPointHistoryList(reports)
        }

        fetchReports()

    }, [selectedIDs])

    useEffect(() => {
        const t = []

        const list = pointHistoryList

        for(let i = 0; i < list.length; i++){

            if (list[i].PointsHistory === undefined || list[i].PointsHistory === null) {
                const row = []

                row.push(...[list[i].DriverID, list[i].DriverFName + " " + list[i].DriverLName, list[i].DriverEmail, list[i].OrganizationName, "", "", ""])

                t.push(row)
            }
            else{
                const segment = []
                for(let j = 0; j < list[i].PointsHistory.length; j++){
                    const row = []

                    if(j !== 0){
                        row.push(...[list[i].DriverID, list[i].DriverFName + " " + list[i].DriverLName, list[i].DriverEmail, list[i].OrganizationName])
                    }
                    else{
                        row.push(...["","","",""])
                    }

                    row.push(list[i].PointsHistory[j]["Points Category"])
                    row.push(list[i].PointsHistory[j]["Reason"])
                    row.push(list[i].PointsHistory[j]["CreatedAt"])

                    segment.push(row)
                }
                t.push(...segment.reverse())
            }

        }

        setTable(t)
    }, [pointHistoryList])

    var drivers = []
    pointHistoryList.map((d) => {
        drivers.push({
          driverID:d.DriverID,
          driverFName: d.DriverFName,
          driverLName:d.DriverLName,
          driverEmail:d.DriverEmail,
          organizationID:d.OrganizationID,
          organizationName:d.OrganizationName
        })
    }) 

    return (
        <div>
            <Form.Label>
                Select Driver ID
            </Form.Label>
            <Form.Select onChange={(e) => {
                    const val = e.target.value

                    if (val === "all") {
                        setSelectedIDs(driverIDList)
                    }
                    else{
                        setSelectedIDs([val])
                    }
                }}>
                <option value={"all"}>All Drivers</option>
                {   
                    driverIDList.map((ID, i) => {
                        return (
                            <option value={ID} key={ID}>
                                {ID}
                            </option>
                        )
                    })
                }
            </Form.Select>

            <Table>
                <thead>
                    <tr key="Header">
                        <th>Driver ID</th>
                        <th>Driver Name</th>
                        <th>Driver Email</th>
                        <th>Organization Name</th>
                        <th>Category</th>
                        <th>Reason</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    { table.map((row, i) => {
                        return (
                            <tr key={i}>
                                { row.map((item, j) => {
                                    return (
                                        <th key={String(i) + " " + String(j)}>
                                            {item}
                                        </th>
                                    )
                                })
                                }
                            </tr>
                        )
                    })
                    }
                </tbody>
            </Table>
        <CSVLink data={drivers} filename={"DriverReport.csv"}>Download As CSV File</CSVLink>
        </div>
    )
}

export default IndividualDriverReport;