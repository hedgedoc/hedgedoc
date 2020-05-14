import {Dropdown} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {ApplicationState} from "../../../../../redux";
import {LinkContainer} from "react-router-bootstrap";
import {clearUser} from "../../../../../redux/user/actions";
import "./user-dropdown.scss";
import {Trans} from "react-i18next";

export const UserDropdown: React.FC = () => {
    const user = useSelector((state: ApplicationState) => state.user);
    const dispatch = useDispatch()

    return (
        <Dropdown alignRight>
            <Dropdown.Toggle size="sm" variant="dark" id="dropdown-basic">
                <div className='d-inline-flex align-items-baseline'>
                    <img
                        src={user.photo}
                        className="user-avatar"
                        alt={`Avatar of ${user.name}`}
                    /><span>{user.name}</span>
                </div>
            </Dropdown.Toggle>

            <Dropdown.Menu>
                <LinkContainer to={`/features`}>
                    <Dropdown.Item>
                        <FontAwesomeIcon icon="bolt"/>&nbsp;
                        <Trans i18nKey="features"/>
                    </Dropdown.Item>
                </LinkContainer>
                <LinkContainer to={`/me/export`}>
                    <Dropdown.Item>
                        <FontAwesomeIcon icon="cloud-download-alt"/>&nbsp;
                        <Trans i18nKey="exportUserData"/>
                    </Dropdown.Item>
                </LinkContainer>
                <Dropdown.Item href="#">
                    <FontAwesomeIcon icon="trash"/>&nbsp;
                    <Trans i18nKey="deleteUser"/>
                </Dropdown.Item>
                <Dropdown.Item
                    onClick={() => {
                        dispatch(clearUser());
                    }}>
                    <FontAwesomeIcon icon="sign-out-alt"/>&nbsp;
                    <Trans i18nKey="signOut"/>
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>)
};
