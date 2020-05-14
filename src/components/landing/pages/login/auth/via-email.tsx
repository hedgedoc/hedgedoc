import {Trans, useTranslation} from "react-i18next";
import {Button, Form} from "react-bootstrap";
import React, { Fragment } from "react";
import {useDispatch} from "react-redux";
import {setUser} from "../../../../../redux/user/actions";
import {LoginStatus} from "../../../../../redux/user/types";

const ViaEMail: React.FC = () => {
    useTranslation();
    const dispatch = useDispatch();
    const login = () => {
        dispatch(setUser({photo: "https://robohash.org/testy.png", name: "Test", status: LoginStatus.ok}));
    }
    return (
        <Fragment>
            <h5 className="center">
                <Trans i18nKey="signInVia" values={{service: "E-Mail"}}/>
            </h5>
            <Form>
                <Form.Group controlId="formBasicEmail">
                    <Form.Control type="email" size="sm" placeholder="E-Mail" />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                    <Form.Control type="password" size="sm" placeholder="Password" />
                </Form.Group>
                <Button
                    size="sm"
                    variant="primary"
                    onClick={login}
                >
                    <Trans i18nKey="signIn"/>
                </Button>
            </Form>
        </Fragment>
    );
}

export { ViaEMail }
