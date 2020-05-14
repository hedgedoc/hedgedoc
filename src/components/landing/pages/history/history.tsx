import React, {Fragment, useEffect, useState} from 'react'
import {HistoryCard} from "./history-card/history-card";
import {HistoryTable} from "./history-table/history-table";
import {HistoryTableRow} from './history-table/history-table-row';
import {ToggleButton, ToggleButtonGroup} from 'react-bootstrap';

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

function loadHistoryFromLocalStore() {
    const historyJsonString = window.localStorage.getItem("notehistory");
    return historyJsonString ? JSON.parse(historyJsonString) : [];
}

const History: React.FC = () => {
    const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
    const [viewState, setViewState] = useState<ViewState>({
        viewState: ViewStateEnum.card
    })

    useEffect(() => {
        let history = loadHistoryFromLocalStore();
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
