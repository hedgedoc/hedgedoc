import React from 'react'
import screenshot from './img/screenshot.png';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Trans, useTranslation} from "react-i18next";
import {FeatureLinks} from "./feature-links";
import {CoverButtons} from "./cover-buttons/cover-buttons";

const Intro: React.FC = () => {
    useTranslation();


    return (
        <div>
            <h1>
                <FontAwesomeIcon icon="file-alt"/> CodiMD
            </h1>
            <p className="lead mb-5">
                <Trans i18nKey="coverSlogan"/>
            </p>

            <CoverButtons/>

            <img alt="CodiMD Screenshot" src={screenshot} className="img-fluid mb-5"/>
            <FeatureLinks/>
        </div>
    )
}

export {Intro}
