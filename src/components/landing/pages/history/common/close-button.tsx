import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import "./close-button.scss"
import {Button} from "react-bootstrap";

export interface CloseButtonProps {
    isDark: boolean;
}

const CloseButton: React.FC<CloseButtonProps> = ({isDark}) => {
    return (
        <Button variant={isDark ? "secondary" : "light"}>
            <FontAwesomeIcon
                className="history-close"
                icon="times"
            />
        </Button>
    );
}

export {CloseButton}
