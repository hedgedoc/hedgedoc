import React, {Fragment, useState} from "react";
import {HistoryEntry, pinClick} from "../history";
import {HistoryTable} from "../history-table/history-table";
import {Alert, Row} from "react-bootstrap";
import {Trans} from "react-i18next";
import {HistoryCardList} from "../history-card/history-card-list";
import {ViewStateEnum} from "../history-toolbar/history-toolbar";
import {PagerPagination} from "../../../../pagination/pager-pagination";

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
    pageIndex: number
    onLastPageIndexChange: (lastPageIndex: number) => void
}


export const HistoryContent: React.FC<HistoryContentProps> = ({viewState, entries, onPinClick}) => {
    const [pageIndex, setPageIndex] = useState(0);
    const [lastPageIndex, setLastPageIndex] = useState(0);

    if (entries.length === 0) {
        return (
            <Row className={"justify-content-center"}>
                <Alert variant={"secondary"}>
                    <Trans i18nKey={"noHistory"}/>
                </Alert>
            </Row>
        );
    }

    const mapViewStateToComponent = (viewState: ViewStateEnum) => {
        switch (viewState) {
            default:
            case ViewStateEnum.card:
                return <HistoryCardList entries={entries} onPinClick={onPinClick} pageIndex={pageIndex}
                                        onLastPageIndexChange={setLastPageIndex}/>
            case ViewStateEnum.table:
                return <HistoryTable entries={entries} onPinClick={onPinClick} pageIndex={pageIndex}
                                     onLastPageIndexChange={setLastPageIndex}/>
        }
    }

    return (
        <Fragment>
            {mapViewStateToComponent(viewState)}
            <Row className="justify-content-center">
                <PagerPagination numberOfPageButtonsToShowAfterAndBeforeCurrent={2} lastPageIndex={lastPageIndex}
                                 onPageChange={setPageIndex}/>
            </Row>
        </Fragment>);
}