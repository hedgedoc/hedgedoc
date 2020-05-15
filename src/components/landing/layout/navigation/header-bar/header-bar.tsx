import React, {Fragment} from 'react'
import {Navbar} from 'react-bootstrap';
import {useSelector} from "react-redux";
import {ApplicationState} from "../../../../../redux";
import {NewUserNoteButton} from "../new-user-note-button";
import {UserDropdown} from "../user-dropdown/user-dropdown";
import {SignInButton} from "../sign-in-button";
import {NewGuestNoteButton} from "../new-guest-note-button";
import {LoginStatus} from "../../../../../redux/user/types";
import {HeaderNavLink} from "../header-nav-link";
import "./header-bar.scss";
import {Trans, useTranslation} from "react-i18next";

const HeaderBar: React.FC = () => {
    useTranslation()
    const user = useSelector((state: ApplicationState) => state.user);

    return (
        <Navbar className="justify-content-between">
            <div className="nav header-nav">
                <HeaderNavLink to="/intro">
                    <Trans i18nKey="intro"/>
                </HeaderNavLink>
                <HeaderNavLink to="/history">
                    <Trans i18nKey="history"/>
                </HeaderNavLink>
            </div>
            <div className="d-inline-flex">
                {user.status === LoginStatus.forbidden ?
                    <Fragment>
                        <span className={"mr-1"}>
                            <NewGuestNoteButton/>
                        </span>
                        <SignInButton/>
                    </Fragment>
                    :
                    <Fragment>
                        <span className={"mr-1"}>
                            <NewUserNoteButton/>
                        </span>
                        <UserDropdown/>
                    </Fragment>
                }
            </div>
        </Navbar>
    );
}

export {HeaderBar}

