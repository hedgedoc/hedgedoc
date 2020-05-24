import React from 'react'
import {HistoryEntriesProps} from "../history-content/history-content";
import {HistoryCard} from "./history-card";
import {Pager} from '../../../../pagination/pager';
import {Row} from 'react-bootstrap';

export const HistoryCardList: React.FC<HistoryEntriesProps> = ({entries, onPinClick, pageIndex, onLastPageIndexChange}) => {

    return (
        <Row className="justify-content-center">
            <Pager numberOfElementsPerPage={6} pageIndex={pageIndex} onLastPageIndexChange={onLastPageIndexChange}>
                {
                    entries.map((entry) => (
                        <HistoryCard
                            key={entry.id}
                            entry={entry}
                            onPinClick={onPinClick}
                        />))
                }
            </Pager>
        </Row>
    );
}
