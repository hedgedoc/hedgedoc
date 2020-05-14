import React from "react";
import {LinkContainer} from "react-router-bootstrap";
import {Button} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Trans, useTranslation} from "react-i18next";

export const NewGuestNoteButton: React.FC = () => {
    const {i18n} = useTranslation();
    return (
        <LinkContainer to={'/new'} title={i18n.t("newGuestNote")}>
            <Button
                variant="primary"
                size="sm"
                className="d-inline-flex align-items-center">
                <FontAwesomeIcon icon="plus" className="mr-1"/>
                <span>
                    <Trans i18nKey='newGuestNote'/>
                </span>
            </Button>
        </LinkContainer>)
}
