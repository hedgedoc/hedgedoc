import React from "react"
import {Col, Jumbotron, Row} from "react-bootstrap"
import {Trans, useTranslation} from "react-i18next";
import {ViaEMail} from "./auth/via-email";
import {OneClickType, ViaOneClick} from "./auth/via-one-click";
import {ViaLdap} from "./auth/via-ldap";
import {useSelector} from "react-redux";
import {ApplicationState} from "../../../../redux";

const Login: React.FC = () => {
    useTranslation();
    const authProviders = useSelector((state: ApplicationState) => state.backendConfig.authProviders);
    const customAuthNames = useSelector((state: ApplicationState) => state.backendConfig.customAuthNames);
    const emailForm = authProviders.email ? <ViaEMail/> : null
    const ldapForm = authProviders.ldap ? <ViaLdap/> : null
    const emailLdapSeparator = authProviders.email && authProviders.ldap ? <hr className="w-100 bg-white"/> : null

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

    return (
        <Jumbotron className="bg-dark">
            <div className="my-3">
                <Row className="h-100 flex justify-content-center">
                    {
                        authProviders.email || authProviders.ldap ?
                            <Col xs={12} sm={10} lg={3}>
                                {emailForm}
                                {emailLdapSeparator}
                                {ldapForm}
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
                                            <Col
                                                xs={12}
                                                md={4}
                                                className="p-2 d-flex flex-column"
                                                key={value}
                                            >
                                                <ViaOneClick
                                                    oneClickType={value}
                                                    optionalName={oneClickCustomName(value)}
                                                />
                                            </Col>
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
