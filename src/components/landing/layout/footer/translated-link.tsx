import React from "react";
import {Trans, useTranslation} from "react-i18next";

export interface TranslatedLinkProps {
    href: string;
    i18nKey: string;
}

const TranslatedLink: React.FC<TranslatedLinkProps> = ({href, i18nKey}) => {
    useTranslation();
    return (
        <a href={href}
           target="_blank"
           rel="noopener noreferrer"
           className="text-light">
            <Trans i18nKey={i18nKey}/>
        </a>
    )
}

export {TranslatedLink}
