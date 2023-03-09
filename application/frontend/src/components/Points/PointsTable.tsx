import React from 'react'

export type PointsTableProps = {
    loggedIn: boolean;
    loginRole: number
}


const PointsTable: React.FC<PointsTableProps> = ({
    loggedIn = false,
    loginRole = -1
}) => {
    if (loggedIn) {
        switch (loginRole) {
            case 0: // driver
                return (

                );
            case 1: // sponsor
                // impplement later
                break;
            case 2: // admin
                // implement later
                break;
            default: // loggedIn w/o role -> error from depreciated user
                //implement later
        }
    }
    else {
        return; // nothing to return if not logged in
    }
}

export default PointsTable;