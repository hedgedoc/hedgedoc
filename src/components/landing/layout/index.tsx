import React from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import {History} from "../pages/history/history";
import {Intro} from "../pages/intro/intro";
import {Container} from "react-bootstrap";
import {HeaderBar} from "./navigation/header-bar/header-bar";
import {Footer} from "./footer/footer";
import "./style/index.scss";
import {Login} from "../pages/login/login";

export const Landing: React.FC = () => {
    return (<Container>
        <HeaderBar/>
        <Switch>
            <Route path="/history">
                <History/>
            </Route>
            <Route path="/intro">
                <Intro/>
            </Route>
            <Route path="/login">
                <Login/>
            </Route>
            <Route path="/">
                <Redirect to="/intro"/>
            </Route>
        </Switch>
        <Footer/>
    </Container>)
}
