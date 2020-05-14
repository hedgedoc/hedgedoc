import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";

const CloseButton: React.FC = () => {
    return (
        <FontAwesomeIcon
            className="history-close"
            icon="times"
        />
    );
}

export { CloseButton }
