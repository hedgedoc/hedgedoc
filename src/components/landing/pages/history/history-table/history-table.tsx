import React from "react";
import {Table} from "react-bootstrap"

const HistoryTable: React.FC = ({children}) => {
    return (
        <Table striped bordered hover size="sm" variant="dark">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Last visited</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
            {children}
            </tbody>
        </Table>
    )
}

export { HistoryTable }
