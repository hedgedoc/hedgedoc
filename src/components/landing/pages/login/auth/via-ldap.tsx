import React, {Fragment} from "react";
import {Trans} from "react-i18next";
import {Button, Form} from "react-bootstrap";

const ViaLdap: React.FC = () => {
    return (
        <Fragment>
            <h5 className="center">
                <Trans i18nKey="signInVia" values={{service: "LDAP"}}/>
            </h5>
            <Form>
                <Form.Group controlId="formBasicUsername">
                    <Form.Control type="text" size="sm" placeholder="Username" />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                    <Form.Control type="password" size="sm" placeholder="Password" />
                </Form.Group>
                <Button
                    size="sm"
                    variant="primary"
                >
                    <Trans i18nKey="signIn"/>
                </Button>
            </Form>
        </Fragment>
    )
};

export { ViaLdap }
