import React from "react";
import {HistoryInput} from "../history";
import {PinButton} from "../common/pin-button";
import {CloseButton} from "../common/close-button";
import moment from "moment";

export const HistoryTableRow: React.FC<HistoryInput> = ({pinned, title, lastVisited, onPinChange}) => {
    return (
        <tr>
            <td>{title}</td>
            <td>{moment(lastVisited).format("llll")}</td>
            <td>
                <PinButton pin={pinned} onPinChange={onPinChange}/>
                &nbsp;
                <CloseButton/>
            </td>
        </tr>
    )
}
