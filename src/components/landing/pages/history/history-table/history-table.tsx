import React from "react";
import {Table} from "react-bootstrap"
import {HistoryTableRow} from "./history-table-row";
import {HistoryEntriesProps} from "../history-content/history-content";

const HistoryTable: React.FC<HistoryEntriesProps> = ({entries, onPinClick}) => {
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
            {
                entries.map((entry) =>
                    <HistoryTableRow
                        key={entry.id}
                        entry={entry}
                        onPinClick={onPinClick}
                    />)
            }
            </tbody>
        </Table>
    )
}

export {HistoryTable}
