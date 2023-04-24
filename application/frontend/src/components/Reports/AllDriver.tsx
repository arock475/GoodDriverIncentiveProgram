import { useEffect, useState } from "react";
import { Form, Row, Table } from "react-bootstrap";
import { getUserClaims } from "../../utils/getUserClaims";
import { Driver, Organization, Sponsor, User } from "../CreateUser/CreateUser";

interface TotalsPayload {
    Driver: Driver,
    Organization: Organization,
    Total: number
}

enum SortBy {
    ID,
    Totals
}

const AllDriver = ({}) => {
    const [userClaims, setUserClaims] = useState(getUserClaims()); 
    const [cols, setCols] = useState<TotalsPayload[]>([]);
    const [sponsorCols, setSponsorCols] = useState<TotalsPayload[]>([]);
    const [sponsorOrg, setSponsorOrg] = useState<Organization>({
        ID: 0,
        Name: '',
        Bio: '',
        Phone: '',
        Email: '',
        LogoURL: ''
    });

    const [sortBy, setSortBy] = useState(SortBy.ID);
    const handleSortChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value == 'driverID') {
            setSortBy(SortBy.ID);
        } else if (event.target.value == 'totalPoints') {
            setSortBy(SortBy.Totals);
        }  
    }

    // load selected org
    useEffect(() => {
        const fetchSponsorOrg = () => {
            fetch(`http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/sponsors/u:${userClaims.id}`)
            .then((result) => result.json())
            .then((sponsor: Sponsor) => {
                fetch(`http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/orgs/${sponsor.OrganizationID}`)
                .then((result) => result.json())
                .then((org: Organization) => setSponsorOrg(org));
            });
        }
        if (userClaims.role == User.Sponsor) {
            fetchSponsorOrg(); 
        }
        
    }, []);

    useEffect(() => {
        const fetchCols = async () => {      
            const response = await fetch(`http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/points/totals`);
            const data: TotalsPayload[] = await response.json();
            if (data) {
                switch (sortBy) {
                    case SortBy.ID:
                        data.sort((a, b) => a.Driver.ID - b.Driver.ID);
                        break;
                    case SortBy.Totals:
                        data.sort((a, b) => b.Total - a.Total);
                        break;
                }
                setCols(data);
                setSponsorCols(data.filter((col) => col.Organization.Name === sponsorOrg.Name));
            }
            else {
                throw new Error("Fetch call returned null");
            }
        }
        fetchCols();
    }, [sponsorOrg, sortBy]);


    return (
        <div>
            <Row>
                <Form.Label>Select Sort By</Form.Label>
                <Form.Control as='select' onChange={handleSortChange}>
                    <option value='driverID'>Driver ID</option>
                    <option value='totalPoints'>Total Points</option>
                </Form.Control>
            </Row>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Driver ID</th>
                    <th>Name</th>
                    <th>Organization</th>
                    <th>Points Total</th>
                </tr>
                </thead>
                <tbody>
                {userClaims.role === User.Admin &&
                    cols.map((col) => (
                        <tr  key={col.Organization.Name + " " + col.Driver.User.firstName+ " "+ col.Driver.User.lastName}>
                        <td>{col.Driver.ID}</td>
                        <td>{col.Driver.User.firstName + " " + col.Driver.User.lastName}</td>
                        <td>{col.Organization.Name}</td>
                        <td>{col.Total}</td>
                        </tr>
                    ))
                }
                {userClaims.role === User.Sponsor &&
                    sponsorCols.map((col) => (
                        <tr  key={col.Organization.Name + " " + col.Driver.User.firstName+ " "+ col.Driver.User.lastName}>
                        <td>{col.Driver.ID}</td>
                        <td>{col.Driver.User.firstName + " " + col.Driver.User.lastName}</td>
                        <td>{col.Organization.Name}</td>
                        <td>{col.Total}</td>
                        </tr>
                    ))
                }
                </tbody>
            </Table>
        </div>
    );
}

export default AllDriver;