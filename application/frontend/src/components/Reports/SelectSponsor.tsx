import React, { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table';
import { getUserClaims } from '../../utils/getUserClaims';
import { CSVLink, CSVDownload } from "react-csv";
import Form from 'react-bootstrap/Form';

interface Sponsor {
    OrganizationID: string
}
interface Purchases {
    ID: string
	DriverID:string
	OrganizationID:string
	ItemID:string
	ItemTitle:string
	ImageURL:string
	Points:string
	InCart:string
	CheckedOut:string
	UpdatedAt:string
}

export default function IndividualSponsor () {
    const [sponsor, setSponsor] = useState<Sponsor>()
    const [purchaseHistory, setPurchaseHistory] = useState<Purchases[]>([])
    const [userClaim, setUserClaim] = useState(getUserClaims());
    const [sponsorIDList, setSponsorIDList] = useState([])
    const [selectedIDs, setSelectedIDs] = useState([])

    useEffect(() => {
        fetch(`http://localhost:3333/sponsors`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include"
        }).then(async response => {
            const data = await response.json()

            const sponsorIDs = [];

            data.forEach(item => {
                sponsorIDs.push(item.ID)
            })

            setSponsorIDList(sponsorIDs)

            setSelectedIDs(sponsorIDs)
        }).catch()
    }, [])

    

    useEffect(() => {
        const fetchReports = async () => {
            const promises = await Promise.all(selectedIDs.map(ID => 
                fetch(`http://localhost:3333/reports/sponsor/sales/${ID}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: "include",
                })
            ))

            const reports = await Promise.all(promises.map(x => x.json()))

            setPurchaseHistory(reports)
        }

        fetchReports()

    }, [selectedIDs])


    const DisplayData=purchaseHistory.map(
        (info)=>{
            var data = []
            if(info != null) {
                for(let i = 0; i < Object.keys(info).length; i++) {
                     data.push(
                        <tr key={info[i].ID}>
                            <td>{info[i].DriverID}</td>
                            <td>{info[i].OrganizationID}</td>
                            <td>{info[i].ItemID}</td>
                            <td>{info[i].ItemTitle}</td>
                            <td>{info[i].Points}</td>
                            <td>{info[i].UpdatedAt}</td>
                        </tr>
                    )
                }
                return data;
           }
        }
    )

    var Purchases = []
    purchaseHistory.map((p) => {
        Purchases.push({
          id: p.ID,
          driverID:p.DriverID,
          organizationID: p.OrganizationID,
          itemID:p.ItemID,
          itemName:p.ItemTitle,
          pointsTotal:p.Points,
          time:p.UpdatedAt
        })
    }) 

    return (
        <div>
            <Form.Label>
                Select Sponsor ID
            </Form.Label>
            <Form.Select onChange={(e) => {
                    const val = e.target.value

                    if (val === "all") {
                        setSelectedIDs(sponsorIDList)
                    }
                    else{
                        setSelectedIDs([val])
                    }
                }}>
                <option value={"all"}>All Sponsors</option>
                {   
                    sponsorIDList.map((ID, i) => {
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
                        <th>Organization ID</th>
                        <th>Item ID</th>
                        <th>Item Name</th>
                        <th>Points Total</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {DisplayData}
                </tbody>
            </Table>
            <CSVLink data={Purchases} filename={"SponsorSalesReport.csv"}>Download As CSV File</CSVLink>
        </div>
        
    )
}
