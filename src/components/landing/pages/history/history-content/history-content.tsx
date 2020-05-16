import React from "react";
import {HistoryEntry, pinClick, ViewStateEnum} from "../history";
import {HistoryTable} from "../history-table/history-table";
import {Alert} from "react-bootstrap";
import {Trans} from "react-i18next";
import {HistoryCardList} from "../history-card/history-card-list";

export interface HistoryContentProps {
    viewState: ViewStateEnum
    entries: HistoryEntry[]
    onPinClick: pinClick
}

export interface HistoryEntryProps {
    entry: HistoryEntry,
    onPinClick: pinClick
}

export interface HistoryEntriesProps {
    entries: HistoryEntry[]
    onPinClick: pinClick
}

export const HistoryContent: React.FC<HistoryContentProps> = ({viewState, entries, onPinClick}) => {

    if (entries.length === 0) {
        return (
            <Alert variant={"secondary"}>
                <Trans i18nKey={"noHistory"}/>
            </Alert>
        );
    }

    switch (viewState) {
        default:
        case ViewStateEnum.card:
            return <HistoryCardList entries={entries} onPinClick={onPinClick}/>
        case ViewStateEnum.table:
            return <HistoryTable entries={entries} onPinClick={onPinClick}/>;
    }
}