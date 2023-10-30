/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Logger } from '../../utils/logger'
import { AsyncLoadingBoundary } from '../common/async-loading-boundary/async-loading-boundary'
import { RendererIframe } from '../common/renderer-iframe/renderer-iframe'
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
      <RendererIframe
        frameClasses={'w-100 overflow-y-hidden'}
        markdownContentLines={value ?? []}
        rendererType={RendererType.SIMPLE}
        adaptFrameHeightToContent={true}
        showWaitSpinner={true}
      />
    </AsyncLoadingBoundary>
  )
}
