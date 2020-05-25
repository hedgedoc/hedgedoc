import React, {useState} from "react";
import {Trans, useTranslation} from "react-i18next";
import {Alert, Button, Card, Form} from "react-bootstrap";
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
        <Card className="bg-dark mb-4">
            <Card.Body>
                <Card.Title>
                    <Trans i18nKey="signInVia" values={{service: name}}/>
                </Card.Title>

                <Form onSubmit={onFormSubmit}>
                    <Form.Group controlId="username">
                        <Form.Control
                            isInvalid={error}
                            type="text"
                            size="sm"
                            placeholder={t("username")}
                            onChange={(event) => setUsername(event.currentTarget.value)}
                            className="bg-dark text-white"
                        />
                    </Form.Group>

                    <Form.Group controlId="password">
                        <Form.Control
                            isInvalid={error}
                            type="password"
                            size="sm"
                            placeholder={t("password")}
                            onChange={(event) => setPassword(event.currentTarget.value)}
                            className="bg-dark text-white"
                        />
                    </Form.Group>

                    <Alert className="small" show={error} variant="danger">
                        <Trans i18nKey="errorLdapLogin"/>
                    </Alert>

                    <Button
                        type="submit"
                        variant="primary">
                        <Trans i18nKey="signIn"/>
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export { ViaLdap }
