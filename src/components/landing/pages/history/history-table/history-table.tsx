import React from "react";
import {Table} from "react-bootstrap"
import {HistoryTableRow} from "./history-table-row";
import {HistoryEntriesProps} from "../history-content/history-content";
import {Trans} from "react-i18next";

const HistoryTable: React.FC<HistoryEntriesProps> = ({entries, onPinClick}) => {
    return (
        <Table striped bordered hover size="sm" variant="dark">
            <thead>
            <tr>
                <th><Trans i18nKey={"title"}/></th>
                <th><Trans i18nKey={"lastVisit"}/></th>
                <th><Trans i18nKey={"actions"}/></th>
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
