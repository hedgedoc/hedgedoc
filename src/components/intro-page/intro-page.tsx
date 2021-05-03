/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useState } from 'react'
import { Trans } from 'react-i18next'
import { Branding } from '../common/branding/branding'
import {
  HedgeDocLogoSize,
  HedgeDocLogoType,
  HedgeDocLogoWithText
} from '../common/hedge-doc-logo/hedge-doc-logo-with-text'
import { RenderIframe } from '../editor-page/renderer-pane/render-iframe'
import { CoverButtons } from './cover-buttons/cover-buttons'
import { FeatureLinks } from './feature-links'
import { useIntroPageContent } from './hooks/use-intro-page-content'
import { ShowIf } from '../common/show-if/show-if'
import { RendererType } from '../render-page/rendering-message'
import { WaitSpinner } from '../common/wait-spinner/wait-spinner'

export const IntroPage: React.FC = () => {
  const introPageContent = useIntroPageContent()
  const [rendererReady, setRendererReady] = useState<boolean>(true)

  return (
    <Fragment>
      <div className={ 'flex-fill mt-3' }>
        <h1 dir="auto" className={ 'align-items-center d-flex justify-content-center flex-column' }>
          <HedgeDocLogoWithText logoType={ HedgeDocLogoType.COLOR_VERTICAL } size={ HedgeDocLogoSize.BIG }/>
        </h1>
        <p className="lead">
          <Trans i18nKey="app.slogan"/>
        </p>
        <div className={ 'mb-5' }>
          <Branding delimiter={ false }/>
        </div>
        <CoverButtons/>
        <ShowIf condition={ !rendererReady && introPageContent !== undefined }>
          <WaitSpinner/>
        </ShowIf>
        <ShowIf condition={ !!introPageContent }>
          <RenderIframe
            frameClasses={ 'w-100 overflow-y-hidden' }
            markdownContent={ introPageContent as string }
            disableToc={ true }
            onRendererReadyChange={ (rendererReady => setRendererReady(!rendererReady)) }
            rendererType={ RendererType.INTRO }
            forcedDarkMode={ true }/>
        </ShowIf>
        <hr className={ 'mb-5' }/>
      </div>
      <FeatureLinks/>
    </Fragment>)
}
