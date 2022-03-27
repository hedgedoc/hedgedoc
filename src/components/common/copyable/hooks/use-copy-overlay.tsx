/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactElement, RefObject } from 'react'
import React, { useCallback, useMemo, useState } from 'react'
import { Overlay, Tooltip } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { v4 as uuid } from 'uuid'
import { ShowIf } from '../../show-if/show-if'
import { Logger } from '../../../../utils/logger'
import { isClientSideRendering } from '../../../../utils/is-client-side-rendering'

const log = new Logger('useCopyOverlay')

/**
 * Provides a function that writes the given text into the browser clipboard and an {@link Overlay overlay} that is shown when the copy action was successful.
 *
 * @param clickComponent The component to which the overlay should be attached
 * @param content The content that should be copied
 * @return the copy function and the overlay
 */
export const useCopyOverlay = (
  clickComponent: RefObject<HTMLElement>,
  content: string
): [copyToCliphoard: () => void, overlayElement: ReactElement] => {
  useTranslation()
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false)
  const [error, setError] = useState(false)
  const [tooltipId] = useState<string>(() => uuid())

  const copyToClipboard = useCallback(() => {
    if (!isClientSideRendering()) {
      log.error('Clipboard not available in server side rendering')
      return
    }
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setError(false)
      })
      .catch((error: Error) => {
        setError(true)
        log.error('Copy failed', error)
      })
      .finally(() => {
        setShowCopiedTooltip(true)
        setTimeout(() => {
          setShowCopiedTooltip(false)
        }, 2000)
      })
  }, [content])

  const overlayElement = useMemo(
    () => (
      <Overlay target={clickComponent} show={showCopiedTooltip} placement='top'>
        {(props) => (
          <Tooltip id={`copied_${tooltipId}`} {...props}>
            <ShowIf condition={error}>
              <Trans i18nKey={'copyOverlay.error'} />
            </ShowIf>
            <ShowIf condition={!error}>
              <Trans i18nKey={'copyOverlay.success'} />
            </ShowIf>
          </Tooltip>
        )}
      </Overlay>
    ),
    [clickComponent, error, showCopiedTooltip, tooltipId]
  )

  return [copyToClipboard, overlayElement]
}
