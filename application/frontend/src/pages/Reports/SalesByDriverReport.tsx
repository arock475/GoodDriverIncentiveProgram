import React, { useEffect } from "react";
import { useState } from "react";
import { getUserClaims } from "../../utils/getUserClaims";
import { Driver, Sponsor, User } from "../../components/CreateUser/CreateUser";
import { Col, Form, Row, Table } from "react-bootstrap";
import { Organization } from "../Organizations/Organization";


export interface Purchase {
    ID: number,
    Driver: Driver,
    Organization: Organization
    ItemID: string,
    ItemTitle: string,
    ImageURL: string,
    Points: number,
    InCart: boolean,
    CheckedOut: boolean,
    UpdatedAt: string
}

interface Total {
    Driver: Driver,
    Total: number
}

const SalesByDriverReport = ({}) => {
    // claim: depreciated replace with viewAs later
    const [userClaim, setUserClaim] = useState(getUserClaims());

    // states
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [totals, setTotals] = useState<Total[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [selectedDriverID, setSelectedDriverID] = useState('all');
    const [selectedOrgID, setSelectedOrgID] = useState('all')
    const [orgTotals, setOrgTotals] = useState<Total[]>([]);
    const [driverPurchases, setDriverPurchases] = useState<Purchase[]>([]);

    const handleDriverViewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDriverID(event.target.value);
    }

    const handleOrgChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedOrgID(event.target.value);
    }

    useEffect(() => {     
        // filter totals (all drivers)
        if (selectedDriverID === 'all') {
            // filter by organization
            if (selectedOrgID  === 'all') {
                setOrgTotals(totals);
            } 
            else {
                const fetchOrgTotals = async () => {
                    const response = await fetch(`http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/reports/salesbydriver/o:${selectedOrgID}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: "include",
                    });
                    const data = await response.json();
                    setOrgTotals(data);
                }
                fetchOrgTotals();
            }  
        }
        // filter purchases (individual driver)
        else {
            let filteredPurchases: Purchase[]
            // filter by organization
            if (selectedOrgID  === 'all') {
                filteredPurchases = purchases
            } 
            else {
                filteredPurchases = purchases.filter(purchase => `${purchase.Organization.ID}` === selectedOrgID);
            }
            // filter by individual driver
            setDriverPurchases(filteredPurchases.filter(purchase => `${purchase.Driver.ID}` === selectedDriverID))
        }
    }, [selectedDriverID, selectedOrgID, totals]);

    useEffect(() => {
        const fetchSponsorOrgID = async () => {
            const response = await fetch(`http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/sponsors/u:${userClaim.id}`);
            const sponsor: Sponsor = await response.json();
            setSelectedOrgID(`${sponsor.OrganizationID}`);
        }
        if (userClaim.role == User.Sponsor) {
            fetchSponsorOrgID(); 
        }

        const fetchOrgs = async () => {
            const response = await fetch('http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/orgs');
            const data = await response.json();
            setOrgs(data);
        }
        if (userClaim.role == User.Admin) {
            fetchOrgs();
        }

        const fetchTotals = async () => {
            const response = await fetch('http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/reports/salesbydriver', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include",
            });
            const data = await response.json();
            setTotals(data);
            setOrgTotals(data);
        }
        fetchTotals();

        const fetchPurchases = async () => {
            const response = await fetch('http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/reports/purchases', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include",
            });
            const data = await response.json();
            setPurchases(data);
        }
        fetchPurchases();
    }, []);

    const getTotalsSum = (totals: Total[]) => {
        return totals.reduce((total, t) => total + t.Total, 0);
    };
    
    const getPurchasesSum = (purchases: Purchase[]) => {
        return purchases.reduce((total, p) => total + p.Points, 0);
    }

    // html
    if (userClaim.role != User.Admin && userClaim.role != User.Sponsor) {
        return (
            <div>
                ERROR: Improper role for accessing this page!
            </div>
        );
    }
    else {
        return (
            <Form>
                <Row>
                {(userClaim.role == User.Admin || userClaim.role == User.Sponsor) &&
                    <Col>
                        <Form.Label>Select By Driver</Form.Label>           
                        <Form.Control as='select' onChange={handleDriverViewChange}>
                            <option value={'all'}>All Drivers</option>
                            {
                                totals.map((total) => (
                                    <option key={total.Driver.ID} value={total.Driver.ID}>{total.Driver.User.firstName + " " + total.Driver.User.lastName}</option>
                                ))
                            }
                        </Form.Control>
                    </Col>
                }
                {(userClaim.role == User.Admin) &&
                    <Col>
                        <Form.Label>Select By Organization</Form.Label>           
                        <Form.Control as='select' onChange={handleOrgChange}>
                            <option value={'all'}>All Organizations</option>
                            {
                                orgs.map((org) => (
                                    <option key={org.ID} value={org.ID}>{org.Name}</option>
                                ))
                            }
                        </Form.Control>
                    </Col>
                }
                </Row>
                {(selectedDriverID === 'all' ) && 
                    <Row>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>Driver ID</th>
                                <th>Name</th>
                                <th>Total Purchases</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                orgTotals.map((total) => (
                                    <tr>
                                        <td>{total.Driver.ID}</td>
                                        <td>{total.Driver.User.firstName + " " + total.Driver.User.lastName}</td>
                                        <td>{total.Total}</td>
                                    </tr>
                                ))
                            }
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={2}>Total</td>
                                    <td>{getTotalsSum(orgTotals)}</td>
                                </tr>
                            </tfoot>
                        </Table>
                    </Row>
                }
                {(selectedDriverID !== 'all') &&
                    <Row>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>Item ID</th>
                                <th>Item Title</th>
                                <th>Points</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                driverPurchases.map((purchase) => (
                                    <tr>
                                        <td>{purchase.ItemID}</td>
                                        <td>{purchase.ItemTitle}</td>
                                        <td>{purchase.Points}</td>
                                    </tr>
                                ))
                            }
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={2}>Total</td>
                                    <td>{getPurchasesSum(driverPurchases)}</td>
                                </tr>
                            </tfoot>
                        </Table>
                    </Row>
                }
            </Form>
        );
    }
}


export default SalesByDriverReport;