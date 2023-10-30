/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Logger } from '../../../../utils/logger'
import type { ReactElement, RefObject } from 'react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Overlay, Tooltip } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useTimeoutFn } from 'react-use'
import { v4 as uuid } from 'uuid'

const log = new Logger('useCopyOverlay')

enum SHOW_STATE {
  SUCCESS,
  ERROR,
  HIDDEN
}

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
  const [showState, setShowState] = useState<SHOW_STATE>(SHOW_STATE.HIDDEN)
  const [tooltipId] = useState<string>(() => uuid())

  const [, , reset] = useTimeoutFn(() => setShowState(SHOW_STATE.HIDDEN), 2000)

  useEffect(() => {
    if (showState !== SHOW_STATE.HIDDEN) {
      reset()
    }
  }, [reset, showState])

  const copyToClipboard = useCallback(() => {
    if (typeof navigator.clipboard === 'undefined') {
      setShowState(SHOW_STATE.ERROR)
      return
    }
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setShowState(SHOW_STATE.SUCCESS)
      })
      .catch((error: Error) => {
        setShowState(SHOW_STATE.ERROR)
        log.error('Copy failed', error)
      })
  }, [content])

  const overlayElement = useMemo(
    () => (
      <Overlay target={clickComponent} show={showState !== SHOW_STATE.HIDDEN} placement='top'>
        {(props) => (
          <Tooltip id={`copied_${tooltipId}`} {...props}>
            {showState === SHOW_STATE.ERROR && <Trans i18nKey={'copyOverlay.error'} />}
            {showState === SHOW_STATE.SUCCESS && <Trans i18nKey={'copyOverlay.success'} />}
          </Tooltip>
        )}
      </Overlay>
    ),
    [clickComponent, showState, tooltipId]
  )

  return [copyToClipboard, overlayElement]
}
