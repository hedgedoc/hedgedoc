import React from "react";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {IconButton} from "./icon-button/icon-button";

export enum OneClickType {
    'DROPBOX'="dropbox",
    'FACEBOOK'="facebook",
    'GITHUB'="github",
    'GITLAB'="gitlab",
    'GOOGLE'="google",
    'OAUTH2'="oauth2",
    'SAML'="saml",
    'TWITTER'="twitter"
}

type OneClick2Map = (oneClickType: OneClickType) => {
    name: string,
    icon: IconProp,
    className: string,
    url: string
};

const buildBackendAuthUrl = (backendName: string) => {
    return `https://localhost:3000/auth/${backendName}`
};

const getMetadata: OneClick2Map = (oneClickType: OneClickType) => {
    switch (oneClickType) {
        case OneClickType.DROPBOX:
            return {
                name: "Dropbox",
                icon: ["fab", "dropbox"],
                className: "btn-social-dropbox",
                url: buildBackendAuthUrl("dropbox")
            }
        case OneClickType.FACEBOOK:
            return {
                name: "Facebook",
                icon: ["fab", "facebook"],
                className: "btn-social-facebook",
                url: buildBackendAuthUrl("facebook")
            }
        case OneClickType.GITHUB:
            return {
                name: "GitHub",
                icon: ["fab", "github"],
                className: "btn-social-github",
                url: buildBackendAuthUrl("github")
            }
        case OneClickType.GITLAB:
            return {
                name: "GitLab",
                icon: ["fab", "gitlab"],
                className: "btn-social-gitlab",
                url: buildBackendAuthUrl("gitlab")
            }
        case OneClickType.GOOGLE:
            return {
                name: "Google",
                icon: ["fab", "google"],
                className: "btn-social-google",
                url: buildBackendAuthUrl("google")
            }
        case OneClickType.OAUTH2:
            return {
                name: "OAuth2",
                icon: "share",
                className: "btn-primary",
                url: buildBackendAuthUrl("oauth2")
            }
        case OneClickType.SAML:
            return {
                name: "SAML",
                icon: "users",
                className: "btn-success",
                url: buildBackendAuthUrl("saml")
            }
        case OneClickType.TWITTER:
            return {
                name: "Twitter",
                icon: ["fab", "twitter"],
                className: "btn-social-twitter",
                url: buildBackendAuthUrl("twitter")
            }
        default:
            return {
                name: "",
                icon: "exclamation",
                className: "",
                url: "#"
            }
    }
}

export interface ViaOneClickProps {
    oneClickType: OneClickType;
    optionalName?: string;
}

const ViaOneClick: React.FC<ViaOneClickProps> = ({oneClickType, optionalName}) => {
    const {name, icon, className, url} = getMetadata(oneClickType);
    const text = !!optionalName ? optionalName : name;
    return (
        <IconButton
            backgroundClass={className}
            icon={icon}
            href={url}
            title={text}
        >
            {text}
        </IconButton>
    )
}

export {ViaOneClick}
