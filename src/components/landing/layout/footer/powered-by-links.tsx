import {Trans, useTranslation} from "react-i18next";
import {TranslatedLink} from "./translated-link";
import React, {Fragment} from "react";
import {ExternalLink} from "./external-link";
import {useSelector} from "react-redux";
import {ApplicationState} from "../../../../redux";

const PoweredByLinks: React.FC = () => {
    useTranslation();
    const defaultLinks = [
        {
            href: '/s/release-notes',
            i18nKey: 'releases'
        },
        {
            href: 'https://github.com/codimd/server/tree/41b13e71b6b1d499238c04b15d65e3bd76442f1d',
            i18nKey: 'sourceCode'
        }
    ]

    const config = useSelector((state: ApplicationState) => state.backendConfig);

    const specialLinks = Object.entries(config.specialLinks)
            .filter(([_, value]) => value !== "")
            .map(([key, value]) => {
                return {
                    href: value,
                    i18nKey: key
                }
            })

    return (
        <p>
            <Trans i18nKey="poweredBy" components={[<ExternalLink href="https://codimd.org" text="CodiMD"/>]}/>

            {
                (defaultLinks.concat(specialLinks)).map(({href, i18nKey}) =>
                    <Fragment key={i18nKey}>
                        &nbsp;|&nbsp;
                        <TranslatedLink
                            href={href}
                            i18nKey={i18nKey}
                        />
                    </Fragment>
                )
            }
        </p>
    )
}

export { PoweredByLinks }
