import { rmSync } from 'fs';
import React, { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import { CSVLink, CSVDownload } from "react-csv";

const getRange = (start, stop) => {
    return Array.from({length: stop - start},
        (value, idx) => start + idx    
    )
}

const IndividualDriverReport: React.FC<{}> = () => {
    const [driverIDList, setDriverIDList] = useState([])
    const [selectedIDs, setSelectedIDs] = useState([])
    const [pointHistoryList, setPointHistoryList] = useState([])
    const [table, setTable] = useState([])

    const [yearRange, setYearRange] = useState([])
    const [monthRange, setMonthRange] = useState([])
    const [dayRange, setDayRange] = useState([])
    
    const [fromYear, setFromYear] = useState(2020)
    const [fromMonth, setFromMonth] = useState(1)
    const [fromDay, setFromDay] = useState(1)
    const [toYear, setToYear] = useState(2023)
    const [toMonth, setToMonth] = useState(12)
    const [toDay, setToDay] = useState(31)

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
        if(fromYear > toYear || (fromYear === toYear && fromMonth > toMonth) || (fromYear === toYear && fromMonth === toMonth && fromDay > toDay)){
            setTable([])
            return
        }

        const t = []

        const phCopy = structuredClone(pointHistoryList)

        const list = phCopy.map((val, idx) => {
            if(val.PointsHistory === null) return val

            val.PointsHistory = val.PointsHistory.filter(ph => {
                const year = Number(ph["CreatedAt"].slice(0, 4))
                const month = Number(ph["CreatedAt"].slice(5, 7))
                const day = Number(ph["CreatedAt"].slice(8, 10))
    
                return year >= fromYear && year <= toYear && month >= fromMonth && month <= toMonth && day >= fromDay && day <= toDay 
            })

            return val
        })
        
        for(let i = 0; i < list.length; i++){

            if (list[i].PointsHistory === undefined || list[i].PointsHistory === null) {
                const row = []

                row.push(...[list[i].DriverID, list[i].DriverFName + " " + list[i].DriverLName, list[i].DriverEmail, list[i].OrganizationName, "", "", ""])

                t.push(row)
            }
            else{
                const segment = []
                const pointHistoryLength = list[i].PointsHistory.length
                for(let j = 0; j < pointHistoryLength; j++){

                    const row = []

                    if(j === pointHistoryLength - 1){
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
    }, [pointHistoryList, fromYear, fromMonth, fromDay, toYear, toMonth, toDay])

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
            <div className="row">
                <div className="col-md-2">
                    <Form.Label>
                        From Year
                    </Form.Label>
                    <Form.Select onChange={(e) => {
                            setFromYear(Number(e.target.value))
                        }}>
                        {   
                            getRange(2020, 2024).reverse().map((val, idx) => {
                                if(val === fromYear) return(
                                    <option value={val} key={val} selected>
                                        {val}
                                    </option>
                                )

                                return (
                                    <option value={val} key={val}>
                                        {val}
                                    </option>
                                )
                            })
                        }
                    </Form.Select>
                </div>
                <div className="col-md-2">
                    <Form.Label>
                        From Month
                    </Form.Label>
                    <Form.Select onChange={(e) => {
                            setFromMonth(Number(e.target.value))
                        }}>
                        {   
                            getRange(1, 13).map((val, idx) => {
                                if(val === fromMonth) return(
                                    <option value={val} key={val} selected>
                                        {val}
                                    </option>
                                )

                                return (
                                    <option value={val} key={val}>
                                        {val}
                                    </option>
                                )
                            })
                        }
                    </Form.Select>
                </div>
                <div className="col-md-2">
                    <Form.Label>
                        From Day
                    </Form.Label>
                    <Form.Select onChange={(e) => {
                            setFromDay(Number(e.target.value))
                        }}>
                        {   
                            getRange(1, 32).map((val, idx) => {
                                if(val === fromDay) return(
                                    <option value={val} key={val} selected>
                                        {val}
                                    </option>
                                )

                                return (
                                    <option value={val} key={val}>
                                        {val}
                                    </option>
                                )
                            })
                        }
                    </Form.Select>
                </div>
            </div>

            <div className="row">
                <div className="col-md-2">
                    <Form.Label>
                        To Year
                    </Form.Label>
                    <Form.Select onChange={(e) => {
                            setToYear(Number(e.target.value))
                        }}>
                        {   
                            getRange(2020, 2024).reverse().map((val, idx) => {
                                if(val === toYear) return(
                                    <option value={val} key={val} selected>
                                        {val}
                                    </option>
                                )

                                return (
                                    <option value={val} key={val}>
                                        {val}
                                    </option>
                                )
                            })
                        }
                    </Form.Select>
                </div>
                <div className="col-md-2">
                    <Form.Label>
                        To Month
                    </Form.Label>
                    <Form.Select onChange={(e) => {
                            setToMonth(Number(e.target.value))
                        }}>
                        {   
                            getRange(1, 13).map((val, idx) => {
                                if(val === toMonth) return(
                                    <option value={val} key={val} selected>
                                        {val}
                                    </option>
                                )

                                return (
                                    <option value={val} key={val}>
                                        {val}
                                    </option>
                                )
                            })
                        }
                    </Form.Select>
                </div>
                <div className="col-md-2">
                    <Form.Label>
                        To Day
                    </Form.Label>
                    <Form.Select onChange={(e) => {
                            setToDay(Number(e.target.value))
                        }}>
                        {   
                            getRange(1, 32).map((val, idx) => {
                                if(val === toDay) return(
                                    <option value={val} key={val} selected>
                                        {val}
                                    </option>
                                )

                                return (
                                    <option value={val} key={val}>
                                        {val}
                                    </option>
                                )
                            })
                        }
                    </Form.Select>
                </div>
            </div>
            

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