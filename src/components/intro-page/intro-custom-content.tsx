/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useMemo } from 'react'
import { useIntroPageContent } from './hooks/use-intro-page-content'
import { useApplicationState } from '../../hooks/common/use-application-state'
import { WaitSpinner } from '../common/wait-spinner/wait-spinner'
import { RenderIframe } from '../editor-page/renderer-pane/render-iframe'
import { RendererType } from '../render-page/window-post-message-communicator/rendering-message'

/**
 * Fetches the content for the customizable part of the intro page and renders it.
 */
export const IntroCustomContent: React.FC = () => {
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
    <Fragment>
      {spinner}
      {introContent}
    </Fragment>
  )
}
