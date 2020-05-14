import React from "react";
import {HistoryInput} from "../history";
import {format} from "date-fns";
import {PinButton} from "../common/pin-button";
import {CloseButton} from "../common/close-button";

export const HistoryTableRow: React.FC<HistoryInput> = ({pinned, title, lastVisited, onPinChange}) => {
    return (
        <tr>
            <td>{title}</td>
            <td>{format(lastVisited, 'EEE, LLL d, YYY h:mm a')}</td>
            <td>
                <PinButton pin={pinned} onPinChange={onPinChange}/>
                &nbsp;
                <CloseButton/>
            </td>
        </tr>
    )
}