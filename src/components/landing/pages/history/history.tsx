import React, {Fragment, useEffect, useState} from 'react'
import {HistoryCard} from "./history-card/history-card";
import {HistoryTable} from "./history-table/history-table";
import {HistoryTableRow} from './history-table/history-table-row';
import {ToggleButton, ToggleButtonGroup} from 'react-bootstrap';
import moment from "moment";

interface HistoryChange {
    onPinChange: () => void,
}

interface ViewState {
    viewState: ViewStateEnum
}

enum ViewStateEnum {
    card,
    table
}

export type HistoryInput = HistoryEntry & HistoryChange

interface HistoryEntry {
    id: string,
    title: string,
    lastVisited: Date,
    tags: string[],
    pinned: boolean
}

interface OldHistoryEntry {
    id: string;
    text: string;
    time: number;
    tags: string[];
    pinned: boolean;
}

function loadHistoryFromLocalStore() {
    const historyJsonString = window.localStorage.getItem("history");
    if (historyJsonString === null) {
        // if localStorage["history"] is empty we check the old localStorage["notehistory"]
        // and convert it to the new format
        const oldHistoryJsonString = window.localStorage.getItem("notehistory")
        const oldHistory = oldHistoryJsonString ? JSON.parse(JSON.parse(oldHistoryJsonString)) : [];
        return oldHistory.map((entry: OldHistoryEntry) => {
            return {
                id: entry.id,
                title: entry.text,
                lastVisited: moment(entry.time).toDate(),
                tags: entry.tags,
                pinned: entry.pinned,
            }
        })
    } else {
        return JSON.parse(historyJsonString)
    }
}

const History: React.FC = () => {
    const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
    const [viewState, setViewState] = useState<ViewState>({
        viewState: ViewStateEnum.card
    })

    useEffect(() => {
        const history = loadHistoryFromLocalStore();
        setHistoryEntries(history);
    }, [])

    return (
        <Fragment>
            <h1>History</h1>
            <ToggleButtonGroup type="radio" name="options" defaultValue={ViewStateEnum.card} className="mb-2"
                               onChange={(newState: ViewStateEnum) => setViewState(() => ({viewState: newState}))}>
                <ToggleButton value={ViewStateEnum.card}>Card</ToggleButton>
                <ToggleButton value={ViewStateEnum.table}>Table</ToggleButton>
            </ToggleButtonGroup>
            {
                viewState.viewState === ViewStateEnum.card ? (
                    <div className="d-flex flex-wrap">
                        {
                            historyEntries.length === 0 ?
                                ''
                            :
                                historyEntries.map((entry) =>
                                    <HistoryCard
                                        id={entry.id}
                                        tags={entry.tags}
                                        pinned={entry.pinned}
                                        title={entry.title}
                                        lastVisited={entry.lastVisited}
                                        onPinChange={() => {
                                            //   setHistoryEntries((prev: HistoryEntry) => {
                                            //        return {...prev, pinned: !prev.pinned};
                                            //     });
                                        }}
                                    />)
                        }
                    </div>
                ) : (
                    <HistoryTable>
                        {
                            historyEntries.length === 0 ?
                                ''
                            :
                                historyEntries.map((entry) =>
                                    <HistoryTableRow
                                        id={entry.id}
                                        tags={entry.tags}
                                        pinned={entry.pinned}
                                        title={entry.title}
                                        lastVisited={entry.lastVisited}
                                        onPinChange={() => {
                                            //    setEntry((prev: HistoryEntry) => {
                                            //       return {...prev, pinned: !prev.pinned};
                                            //   });
                                        }}
                                    />)
                        }
                    </HistoryTable>
                )
            }
        </Fragment>
    )
}

export {History}
