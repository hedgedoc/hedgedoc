import React, {Fragment, useState} from "react";
import {Trans, useTranslation} from "react-i18next";
import {Alert, Button, Form} from "react-bootstrap";
import {postLdapLogin} from "../../../../../api/user";
import {getAndSetUser} from "../../../../../utils/apiUtils";
import {useSelector} from "react-redux";
import {ApplicationState} from "../../../../../redux";

const ViaLdap: React.FC = () => {
    const {t} = useTranslation();
    const ldapCustomName = useSelector((state: ApplicationState) => state.backendConfig.customAuthNames.ldap);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const name = ldapCustomName ? `${ldapCustomName} (LDAP)` : "LDAP";

    const doAsyncLogin = () => {
        (async () => {
            try {
                await postLdapLogin(username, password);
                await getAndSetUser();
            } catch {
                setError(true);
            }
        })();
    }

    const onFormSubmit = (event: any) => {
        doAsyncLogin();
        event.preventDefault();
    }

    return (
        <Fragment>
            <h5 className="center">
                <Trans i18nKey="signInVia" values={{service: name}}/>
            </h5>
            <Form onSubmit={onFormSubmit}>
                <Form.Group controlId="username">
                    <Form.Control
                        isInvalid={error}
                        type="text"
                        size="sm"
                        placeholder={t("username")}
                        onChange={(event) => setUsername(event.currentTarget.value)}
                    />
                </Form.Group>

                <Form.Group controlId="password">
                    <Form.Control
                        isInvalid={error}
                        type="password"
                        size="sm"
                        placeholder={t("password")}
                        onChange={(event) => setPassword(event.currentTarget.value)}
                    />
                </Form.Group>

                <Alert className="small" show={error} variant="danger">
                    <Trans i18nKey="errorLdapLogin"/>
                </Alert>

                <Button
                    type="submit"
                    size="sm"
                    variant="primary">
                    <Trans i18nKey="signIn"/>
                </Button>
            </Form>
        </Fragment>
    );
};

export { ViaLdap }
