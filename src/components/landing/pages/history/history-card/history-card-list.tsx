import React, {Fragment} from 'react'
import {HistoryEntriesProps} from "../history-content/history-content";
import {HistoryCard} from "./history-card";

export const HistoryCardList: React.FC<HistoryEntriesProps> = ({entries, onPinClick}) => {
    return (
        <Fragment>
            {
                entries.map((entry) => (
                    <HistoryCard
                        key={entry.id}
                        entry={entry}
                        onPinClick={onPinClick}
                    />))
            }
        </Fragment>
    )
}
