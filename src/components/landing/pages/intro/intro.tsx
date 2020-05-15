import React, { Fragment } from 'react'
import screenshot from './img/screenshot.png';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Button} from 'react-bootstrap';
import {Trans, useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";
import {ApplicationState} from "../../../../redux";

const Intro: React.FC = () => {
    // ToDo replace this with comment
    const url = "http://localhost:3000";//useServerUrl();
    useTranslation();
    const user = useSelector((state: ApplicationState) => state.user);

    return (
        <div id="home" className="section">
            <div className="inner cover">
                <h1 className="cover-heading">
                    <FontAwesomeIcon icon="file-alt"/> CodiMD
                </h1>
                <p className="lead mb-5">
                    <Trans i18nKey="coverSlogan"/>
                </p>

                {
                    user.status === "forbidden" ?
                        <Fragment>
                            <div className="mb-5">
                                <Link to="/login">
                                    <Button
                                        variant="success"
                                        size="lg"
                                        style={{minWidth: "200px"}}
                                    >
                                        <Trans i18nKey="signIn"/>
                                    </Button>
                                </Link>


                                <span className="m-2">
                                    or
                                </span>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    href={`${url}/features`}
                                    style={{minWidth: "200px"}}
                                >
                                    <Trans i18nKey="exploreFeatures"/>
                                </Button>
                            </div>

                            <img alt="CodiMD Screenshot" src={screenshot} className="screenshot img-fluid mb-5"/>
                        </Fragment>
                    :
                        null
                }

                <div className="lead row mb-5" style={{width: '90%', margin: '0 auto'}}>
                    <div className="col-md-4 inner">
                        <a href={`${url}/features#Share-Notes`} className="text-light">
                            <FontAwesomeIcon icon="bolt" size="3x"/>
                            <h5>
                                <Trans i18nKey="featureCollaboration"/>
                            </h5>
                        </a>
                    </div>
                    <div className="col-md-4 inner">
                        <a href={`${url}/features#MathJax`} className="text-light">
                            <FontAwesomeIcon icon="chart-bar" size="3x"/>
                            <h5>
                                <Trans i18nKey="featureMathJax"/>
                            </h5>
                        </a>
                    </div>
                    <div className="col-md-4 inner">
                        <a href={`${url}/features#Slide-Mode`} className="text-light">
                            <FontAwesomeIcon icon="tv" size="3x"/>
                            <h5>
                                <Trans i18nKey="featureSlides"/>
                            </h5>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export {Intro}
