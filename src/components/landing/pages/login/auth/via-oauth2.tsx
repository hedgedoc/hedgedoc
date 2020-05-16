import React from "react";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {IconButton} from "./icon-button/icon-button";

export enum OAuth2Type {
    'DROPBOX'="dropbox",
    'FACEBOOK'="facebook",
    'GITHUB'="github",
    'GITLAB'="gitlab",
    'GOOGLE'="google",
    'OAUTH2'="oauth2",
    'SAML'="saml",
    'TWITTER'="twitter"
}

type OAuth2Map = (oauth2type: OAuth2Type) => {
    name: string,
    icon: IconProp,
    className: string,
    url: string
};

const buildBackendAuthUrl = (backendName: string) => {
    return `https://localhost:3000/auth/${backendName}`
};

const getMetadata: OAuth2Map = (oauth2type: OAuth2Type) => {
    switch (oauth2type) {
        case OAuth2Type.DROPBOX:
            return {
                name: "Dropbox",
                icon: ["fab", "dropbox"],
                className: "btn-social-dropbox",
                url: buildBackendAuthUrl("dropbox")
            }
        case OAuth2Type.FACEBOOK:
            return {
                name: "Facebook",
                icon: ["fab", "facebook"],
                className: "btn-social-facebook",
                url: buildBackendAuthUrl("facebook")
            }
        case OAuth2Type.GITHUB:
            return {
                name: "GitHub",
                icon: ["fab", "github"],
                className: "btn-social-github",
                url: buildBackendAuthUrl("github")
            }
        case OAuth2Type.GITLAB:
            return {
                name: "GitLab",
                icon: ["fab", "gitlab"],
                className: "btn-social-gitlab",
                url: buildBackendAuthUrl("gitlab")
            }
        case OAuth2Type.GOOGLE:
            return {
                name: "Google",
                icon: ["fab", "google"],
                className: "btn-social-google",
                url: buildBackendAuthUrl("google")
            }
        case OAuth2Type.OAUTH2:
            return {
                name: "OAuth2",
                icon: "share",
                className: "btn-primary",
                url: buildBackendAuthUrl("oauth2")
            }
        case OAuth2Type.SAML:
            return {
                name: "SAML",
                icon: "users",
                className: "btn-success",
                url: buildBackendAuthUrl("saml")
            }
        case OAuth2Type.TWITTER:
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

export interface ViaOAuth2Props {
    oauth2Type: OAuth2Type;
    optionalName?: string;
}

const ViaOAuth2: React.FC<ViaOAuth2Props> = ({oauth2Type, optionalName}) => {
    const {name, icon, className, url} = getMetadata(oauth2Type);
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

export {ViaOAuth2}
