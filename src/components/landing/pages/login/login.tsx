import React from "react"
import {Col, Jumbotron, Row} from "react-bootstrap"
import {Trans, useTranslation} from "react-i18next";
import {ViaEMail} from "./auth/via-email";
import {OneClickType, ViaOneClick} from "./auth/via-one-click";
import {ViaLdap} from "./auth/via-ldap";
import {useSelector} from "react-redux";
import {ApplicationState} from "../../../../redux";
import {ViaOpenId} from "./auth/via-open id";
import "./login.scss";
import {ElementSeparator} from "../../../element-separator/element-separator";
import {Redirect} from "react-router";
import {LoginStatus} from "../../../../redux/user/types";

const Login: React.FC = () => {
    useTranslation();
    const authProviders = useSelector((state: ApplicationState) => state.backendConfig.authProviders);
    const customAuthNames = useSelector((state: ApplicationState) => state.backendConfig.customAuthNames);
    const userLoginState = useSelector((state: ApplicationState) => state.user.status);
    const emailForm = authProviders.email ? <ViaEMail/> : null
    const ldapForm = authProviders.ldap ? <ViaLdap/> : null
    const openIdForm = authProviders.openid ? <ViaOpenId/> : null

    const oneClickCustomName: (type: OneClickType) => string | undefined = (type) => {
        switch (type) {
            case OneClickType.SAML:
                return customAuthNames.saml;
            case OneClickType.OAUTH2:
                return customAuthNames.oauth2;
            default:
                return undefined;
        }
    }
    
    if (userLoginState === LoginStatus.ok) {
        // TODO Redirect to previous page?
        return (
            <Redirect to='/history' />
        )
    }

    return (
        <Jumbotron className="bg-dark">
            <div className="my-3">
                <Row className="h-100 flex justify-content-center">
                    {
                        authProviders.email || authProviders.ldap || authProviders.openid ?
                            <Col xs={12} sm={10} lg={3}>
                                <ElementSeparator separator={<hr className="w-100 bg-white"/>}>
                                    {emailForm}
                                    {ldapForm}
                                    {openIdForm}
                                </ElementSeparator>
                                <hr className="w-100 d-lg-none d-block bg-white"/>
                            </Col>
                            : null
                    }
                    <Col xs={12} sm={10} lg={5}>
                        <h5>
                            <Trans i18nKey="signInVia" values={{service: ""}}/>
                        </h5>
                        <div className={"d-flex flex-wrap one-click-login justify-content-center"}>
                            {
                                Object.values(OneClickType)
                                    .filter((value) => authProviders[value])
                                    .map((value) => {
                                        return (
                                            <div
                                                className="p-2 d-flex flex-column social-button-container"
                                                key={value}
                                            >
                                                <ViaOneClick
                                                    oneClickType={value}
                                                    optionalName={oneClickCustomName(value)}
                                                />
                                            </div>
                                        )
                                    })
                            }
                        </div>
                    </Col>
                </Row>
            </div>
        </Jumbotron>
    )
}

export {Login}
