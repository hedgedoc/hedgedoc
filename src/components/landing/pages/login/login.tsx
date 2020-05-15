import React from "react"
import {Col, Jumbotron, Row} from "react-bootstrap"
import {Trans, useTranslation} from "react-i18next";
import {ViaEMail} from "./auth/via-email";
import {OAuth2Type, ViaOAuth2} from "./auth/via-oauth2";
import {ViaLdap} from "./auth/via-ldap";
import {useSelector} from "react-redux";
import {ApplicationState} from "../../../../redux";

const Login: React.FC = () => {
    useTranslation();
    const authProviders = useSelector((state: ApplicationState) => state.applicationConfig.authProviders);

    const emailForm = authProviders.email ? <ViaEMail/> : null
    const ldapForm = authProviders.ldap ? <ViaLdap/> : null
    const emailLdapSeperator = authProviders.email && authProviders.ldap ? <hr className="w-100 bg-white"/> : null

    return (
        <Jumbotron className="bg-dark">
            <div className="my-3">
                <Row className="h-100 flex justify-content-center">
                    {
                        authProviders.email || authProviders.ldap ?
                            <Col xs={12} sm={10} lg={3}>
                                {emailForm}
                                {emailLdapSeperator}
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
                                Object.values(OAuth2Type)
                                    .filter((value) => authProviders[value])
                                    .map((value) => {
                                        return (
                                            <Col
                                                xs={12}
                                                md={4}
                                                className="p-2 d-flex flex-column"
                                                key={value}
                                            >
                                                <ViaOAuth2 oauth2Type={value}/>
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
