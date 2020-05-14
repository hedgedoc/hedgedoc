import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import "./icon-button.scss";
import {IconProp} from "@fortawesome/fontawesome-svg-core";

export interface SocialButtonProps {
    backgroundClass: string,
    href: string
    icon: IconProp
    title?: string
}

export const IconButton: React.FC<SocialButtonProps> = ({title, backgroundClass, href, icon, children}) => {
    return (
        <a href={href} title={title}
           className={"btn btn-icon p-0 d-inline-flex align-items-stretch " + backgroundClass}>
            <span className="btn-social-button d-flex align-items-center">
                <FontAwesomeIcon icon={icon} className={"social-icon"}/>
            </span>
            <span className="btn-social-text d-flex align-items-center">
                {children}
            </span>
        </a>
    )
}
