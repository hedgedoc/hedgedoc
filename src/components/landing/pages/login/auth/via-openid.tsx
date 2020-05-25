import React, {useState} from "react";
import {Trans, useTranslation} from "react-i18next";
import {Alert, Button, Card, Form} from "react-bootstrap";
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
        <Card className="bg-dark mb-4">
            <Card.Body>
                <Card.Title>
                    <Trans i18nKey="signInVia" values={{service: "OpenID"}}/>
                </Card.Title>

                <Form onSubmit={onFormSubmit}>
                    <Form.Group controlId="openid">
                        <Form.Control
                            isInvalid={error}
                            type="text"
                            size="sm"
                            placeholder={"OpenID"}
                            onChange={(event) => setOpenId(event.currentTarget.value)}
                            className="bg-dark text-white"
                        />
                    </Form.Group>

                    <Alert className="small" show={error} variant="danger">
                        <Trans i18nKey="errorOpenIdLogin"/>
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

export { ViaOpenId }
