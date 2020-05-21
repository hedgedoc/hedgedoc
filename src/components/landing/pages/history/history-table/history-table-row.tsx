import React from "react";
import {PinButton} from "../common/pin-button";
import {CloseButton} from "../common/close-button";
import {useTranslation} from "react-i18next";
import {HistoryEntryProps} from "../history-content/history-content";
import {formatHistoryDate} from "../../../../../utils/historyUtils";

export const HistoryTableRow: React.FC<HistoryEntryProps> = ({entry, onPinClick}) => {
    useTranslation()
    return (
        <tr>
            <td>{entry.title}</td>
            <td>{formatHistoryDate(entry.lastVisited)}</td>
            <td>
                <PinButton isDark={true} isPinned={entry.pinned} onPinClick={() => {
                    onPinClick(entry.id)
                }}/>
                &nbsp;
                <CloseButton isDark={true}/>
            </td>
        </tr>
    )
}
