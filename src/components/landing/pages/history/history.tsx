import React, {Fragment, useEffect, useState} from 'react'
import {ToggleButton, ToggleButtonGroup} from 'react-bootstrap';
import {HistoryContent} from './history-content/history-content';
import {loadHistoryFromLocalStore, sortAndFilterEntries} from "../../../../utils/historyUtils";

export enum ViewStateEnum {
    card,
    table
}

export interface HistoryEntry {
    id: string,
    title: string,
    lastVisited: Date,
    tags: string[],
    pinned: boolean
}

export type pinClick = (entryId: string) => void;

export const History: React.FC = () => {
    const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
    const [viewState, setViewState] = useState<ViewStateEnum>(ViewStateEnum.card)

    useEffect(() => {
        const history = loadHistoryFromLocalStore();
        setHistoryEntries(history);
    }, [])

    useEffect(() => {
        window.localStorage.setItem("history", JSON.stringify(historyEntries));
    }, [historyEntries])

    const pinClick: pinClick = (entryId: string) => {
        setHistoryEntries((entries) => {
            return entries.map((entry) => {
                if (entry.id === entryId) {
                    entry.pinned = !entry.pinned;
                }
                return entry;
            });
        })
    }

    return (
        <Fragment>
            <h1>History</h1>
            <ToggleButtonGroup type="radio" name="options" defaultValue={ViewStateEnum.card} className="mb-2"
                               onChange={(newState: ViewStateEnum) => setViewState(newState)}>
                <ToggleButton value={ViewStateEnum.card}>Card</ToggleButton>
                <ToggleButton value={ViewStateEnum.table}>Table</ToggleButton>
            </ToggleButtonGroup>
            <div className="d-flex flex-wrap justify-content-center">
                <HistoryContent viewState={viewState} entries={sortAndFilterEntries(historyEntries)}
                                onPinClick={pinClick}/>
            </div>
        </Fragment>
    )
}