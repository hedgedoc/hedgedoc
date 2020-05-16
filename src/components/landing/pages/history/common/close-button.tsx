import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import "./close-button.scss"

const CloseButton: React.FC = () => {
    return (
        <FontAwesomeIcon
            className="history-close"
            icon="times"
        />
    );
}

export { CloseButton }
