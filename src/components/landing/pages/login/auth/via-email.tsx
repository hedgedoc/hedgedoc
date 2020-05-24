import {Trans, useTranslation} from "react-i18next";
import {Alert, Button, Form} from "react-bootstrap";
import React, {Fragment, useState} from "react";
import {postEmailLogin} from "../../../../../api/user";
import {getAndSetUser} from "../../../../../utils/apiUtils";

export const ViaEMail: React.FC = () => {
    const {t} = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const doAsyncLogin = () => {
        (async () => {
            try {
                await postEmailLogin(email, password);
                await getAndSetUser();
            } catch {
                setError(true);
            }
        })();
    }

    const onFormSubmit = (event: any) => {
        doAsyncLogin();
        event.preventDefault();
    };

    return (
        <Fragment>
            <h5 className="center">
                <Trans i18nKey="signInVia" values={{service: "E-Mail"}}/>
            </h5>
            <Form onSubmit={onFormSubmit}>
                <Form.Group controlId="email">
                    <Form.Control
                        isInvalid={error}
                        type="email"
                        size="sm"
                        placeholder={t("email")}
                        onChange={(event) => setEmail(event.currentTarget.value)}
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
                    <Trans i18nKey="errorEmailLogin"/>
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
}