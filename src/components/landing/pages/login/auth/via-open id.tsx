import React, {Fragment, useState} from "react";
import {Trans, useTranslation} from "react-i18next";
import {Alert, Button, Form} from "react-bootstrap";
import {postOpenIdLogin} from "../../../../../api/user";
import {getAndSetUser} from "../../../../../utils/apiUtils";

const ViaOpenId: React.FC = () => {
    useTranslation();
    const [openId, setOpenId] = useState("");
    const [error, setError] = useState(false);

    const doAsyncLogin = () => {
        (async () => {
            try {
                await postOpenIdLogin(openId);
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
                <Trans i18nKey="signInVia" values={{service: "OpenID"}}/>
            </h5>
            <Form onSubmit={onFormSubmit}>
                <Form.Group controlId="openid">
                    <Form.Control
                        isInvalid={error}
                        type="text"
                        size="sm"
                        placeholder={"OpenID"}
                        onChange={(event) => setOpenId(event.currentTarget.value)}
                    />
                </Form.Group>

                <Alert className="small" show={error} variant="danger">
                    <Trans i18nKey="errorOpenIdLogin"/>
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

export { ViaOpenId }
