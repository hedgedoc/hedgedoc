/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DarkModePreference } from '../../redux/dark-mode/types'
import { Logger } from '../../utils/logger'
import { AsyncLoadingBoundary } from '../common/async-loading-boundary/async-loading-boundary'
import { RenderIframe } from '../editor-page/renderer-pane/render-iframe'
import { RendererType } from '../render-page/window-post-message-communicator/rendering-message'
import { fetchFrontPageContent } from './requests'
import React, { useEffect } from 'react'
import { useAsync } from 'react-use'

const logger = new Logger('Intro Content')

/**
 * Fetches the content for the customizable part of the intro page and renders it.
 */
export const IntroCustomContent: React.FC = () => {
  const { value, error, loading } = useAsync(async () => (await fetchFrontPageContent()).split('\n'), [])

  useEffect(() => {
    if (error) {
      logger.error('Error while loading custom intro content', error)
    }
  }, [error])

  return (
    <AsyncLoadingBoundary loading={loading || !value} error={error} componentName={'custom intro content'}>
      <RenderIframe
        frameClasses={'w-100 overflow-y-hidden'}
        markdownContentLines={value as string[]}
        rendererType={RendererType.SIMPLE}
        forcedDarkMode={DarkModePreference.DARK}
        adaptFrameHeightToContent={true}
      />
    </AsyncLoadingBoundary>
  )
}
