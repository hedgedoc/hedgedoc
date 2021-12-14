/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
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
import { RendererType } from '../render-page/window-post-message-communicator/rendering-message'
import { WaitSpinner } from '../common/wait-spinner/wait-spinner'
import { useApplicationState } from '../../hooks/common/use-application-state'
import { EditorToRendererCommunicatorContextProvider } from '../editor-page/render-context/editor-to-renderer-communicator-context-provider'

export const IntroPage: React.FC = () => {
  const introPageContent = useIntroPageContent()
  const rendererReady = useApplicationState((state) => state.rendererStatus.rendererReady)

  const spinner = useMemo(() => {
    if (!rendererReady && introPageContent !== undefined) {
      return <WaitSpinner />
    }
  }, [introPageContent, rendererReady])

  const introContent = useMemo(() => {
    if (introPageContent !== undefined) {
      return (
        <RenderIframe
          frameClasses={'w-100 overflow-y-hidden'}
          markdownContentLines={introPageContent}
          rendererType={RendererType.INTRO}
          forcedDarkMode={true}
        />
      )
    }
  }, [introPageContent])

  return (
    <EditorToRendererCommunicatorContextProvider>
      <div className={'flex-fill mt-3'}>
        <h1 dir='auto' className={'align-items-center d-flex justify-content-center flex-column'}>
          <HedgeDocLogoWithText logoType={HedgeDocLogoType.COLOR_VERTICAL} size={HedgeDocLogoSize.BIG} />
        </h1>
        <p className='lead'>
          <Trans i18nKey='app.slogan' />
        </p>
        <div className={'mb-5'}>
          <Branding delimiter={false} />
        </div>
        <CoverButtons />
        {spinner}
        {introContent}
        <hr className={'mb-5'} />
      </div>
      <FeatureLinks />
    </EditorToRendererCommunicatorContextProvider>
  )
}
