/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useState } from 'react'
import { WaitSpinner } from '../common/wait-spinner/wait-spinner'
import { RenderIframe } from '../editor-page/renderer-pane/render-iframe'
import { RendererType } from '../render-page/window-post-message-communicator/rendering-message'
import { useTranslation } from 'react-i18next'
import { fetchFrontPageContent } from './requests'

/**
 * Fetches the content for the customizable part of the intro page and renders it.
 */
export const IntroCustomContent: React.FC = () => {
  const { t } = useTranslation()
  const [content, setContent] = useState<string[] | undefined>(undefined)

  useEffect(() => {
    fetchFrontPageContent()
      .then((content) => setContent(content.split('\n')))
      .catch(() => setContent(undefined))
  }, [t])

  return content === undefined ? (
    <WaitSpinner />
  ) : (
    <RenderIframe
      frameClasses={'w-100 overflow-y-hidden'}
      markdownContentLines={content}
      rendererType={RendererType.INTRO}
      forcedDarkMode={true}
      adaptFrameHeightToContent={true}
    />
  )
}
