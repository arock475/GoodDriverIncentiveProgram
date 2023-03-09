import React from 'react'
import { Container } from 'react-bootstrap';
import PointsTable from '../../components/Points/PointsTable';

export type PointsProps = {
    loggedIn?: boolean,
    loginRole?: number
}

// Points by org is driver point view <- gets points by each of the driver organizations
const Points: React.FC<PointsProps> = ({
    loggedIn = false,
    loginRole = -1
}) => {
    return (
        <Container>
            <PointsTable />
        </Container>
    );
}

export default Points;