import React, { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table';
import { CSVLink, CSVDownload } from "react-csv";

interface Sponsor {
    OrganizationID: string
}
interface Purchases {
    ID: string
    DriverID: string
    OrganizationID: string
    ItemID: string
    ItemTitle: string
    ImageURL: string
    Points: string
    InCart: string
    CheckedOut: string
    UpdatedAt: string
}

export default function IndividualSponsor() {
    const [purchaseHistory, setPurchaseHistory] = useState<Purchases[]>([])

    useEffect(() => {
        fetch(`http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/reports/sponsor/sales/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include"
        }).then(async response => {
            const data = await response.json()
            setPurchaseHistory(data)
        }).catch()
    }, [])

    const DisplayData = purchaseHistory.map(
        (info) => {
            return (
                <tr key={info.ID}>
                    <td>{info.DriverID}</td>
                    <td>{info.OrganizationID}</td>
                    <td>{info.ItemID}</td>
                    <td>{info.ItemTitle}</td>
                    <td>{info.Points}</td>
                    <td>{info.UpdatedAt}</td>
                </tr>
            )
        }
    )

    var Purchases = []
    purchaseHistory.map((p) => {
        Purchases.push({
            id: p.ID,
            driverID: p.DriverID,
            organizationID: p.OrganizationID,
            itemID: p.ItemID,
            itemName: p.ItemTitle,
            pointsTotal: p.Points,
            time: p.UpdatedAt
        })
    })

    return (
        <div>
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
