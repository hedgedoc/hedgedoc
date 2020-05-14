import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";

export interface PinButtonProps {
    pin: boolean;
    onPinChange: () => void;
}

const PinButton: React.FC<PinButtonProps> = ({pin, onPinChange}) => {
    return (
        <FontAwesomeIcon
            icon="thumbtack"
            className={`history-pin ${pin? 'active' : ''}`}
            onClick={onPinChange}
        />
    );
}

export { PinButton }
