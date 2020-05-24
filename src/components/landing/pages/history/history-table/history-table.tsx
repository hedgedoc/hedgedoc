import React from "react";
import {Table} from "react-bootstrap"
import {HistoryTableRow} from "./history-table-row";
import {HistoryEntriesProps} from "../history-content/history-content";
import {Trans} from "react-i18next";
import {Pager} from "../../../../pagination/pager";

export const HistoryTable: React.FC<HistoryEntriesProps> = ({entries, onPinClick, pageIndex, onLastPageIndexChange}) => {
    return (
        <Table striped bordered hover size="sm" variant="dark">
            <thead>
            <tr>
                <th><Trans i18nKey={"title"}/></th>
                <th><Trans i18nKey={"lastVisit"}/></th>
                <th><Trans i18nKey={"tags"}/></th>
                <th><Trans i18nKey={"actions"}/></th>
            </tr>
            </thead>
            <tbody>
            <Pager numberOfElementsPerPage={6} pageIndex={pageIndex} onLastPageIndexChange={onLastPageIndexChange}>
                {
                    entries.map((entry) =>
                        <HistoryTableRow
                            key={entry.id}
                            entry={entry}
                            onPinClick={onPinClick}
                        />)
                }
            </Pager>
            </tbody>
        </Table>
    )
}
