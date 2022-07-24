/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactElement } from 'react'
import React, { useCallback, useRef, useState } from 'react'
import { ShowIf } from '../../common/show-if/show-if'
import { SplitDivider } from './split-divider/split-divider'
import styles from './splitter.module.scss'
import { useAdjustedRelativeSplitValue } from './hooks/use-adjusted-relative-split-value'
import { useBindPointerMovementEventOnWindow } from '../../../hooks/common/use-bind-pointer-movement-event-on-window'

export interface SplitterProps {
  left?: ReactElement
  right?: ReactElement
  additionalContainerClassName?: string
  showLeft: boolean
  showRight: boolean
}

/**
 * Checks if the given {@link Event} is a {@link MouseEvent}.
 *
 * @param event the event to check
 * @return {@link true} if the given event is a {@link MouseEvent}
 */
const isMouseEvent = (event: Event): event is MouseEvent => {
  return (event as MouseEvent).buttons !== undefined
}

const isLeftMouseButtonClicked = (mouseEvent: MouseEvent): boolean => {
  return mouseEvent.buttons === 1
}

/**
 * Extracts the absolute horizontal position of the mouse or first touch point from the event.
 *
 * @param moveEvent The mouse or touch event that contains a pointer position
 * @return the extracted horizontal position or {@link undefined} if no position could be extracted
 */
const extractHorizontalPosition = (moveEvent: MouseEvent | TouchEvent): number | undefined => {
  if (isMouseEvent(moveEvent)) {
    return moveEvent.clientX
  } else {
    return moveEvent.touches[0]?.clientX
  }
}

/**
 * Creates a Left/Right splitter react component.
 *
 * @param additionalContainerClassName css classes that are added to the split container.
 * @param left the react component that should be shown on the left side.
 * @param right the react component that should be shown on the right side.
 * @param showLeft defines if the left component should be shown or hidden. Settings this prop will hide the component with css.
 * @param showRight defines if the right component should be shown or hidden. Settings this prop will hide the component with css.
 * @return the created component
 */
export const Splitter: React.FC<SplitterProps> = ({
  additionalContainerClassName,
  left,
  right,
  showLeft,
  showRight
}) => {
  const [relativeSplitValue, setRelativeSplitValue] = useState(50)
  const adjustedRelativeSplitValue = useAdjustedRelativeSplitValue(showLeft, showRight, relativeSplitValue)
  const resizingInProgress = useRef(false)
  const splitContainer = useRef<HTMLDivElement>(null)

  /**
   * Starts the splitter resizing.
   */
  const onStartResizing = useCallback(() => {
    resizingInProgress.current = true
  }, [])

  /**
   * Stops the splitter resizing.
   */
  const onStopResizing = useCallback(() => {
    if (resizingInProgress.current) {
      resizingInProgress.current = false
    }
  }, [])

  /**
   * Recalculates the panel split based on the absolute mouse/touch position.
   *
   * @param moveEvent is a {@link MouseEvent} or {@link TouchEvent} that got triggered.
   */
  const onMove = useCallback((moveEvent: MouseEvent | TouchEvent) => {
    if (!resizingInProgress.current || !splitContainer.current) {
      return
    }
    if (isMouseEvent(moveEvent) && !isLeftMouseButtonClicked(moveEvent)) {
      resizingInProgress.current = false
      moveEvent.preventDefault()
      return undefined
    }

    const horizontalPosition = extractHorizontalPosition(moveEvent)
    if (horizontalPosition === undefined) {
      return
    }
    const horizontalPositionInSplitContainer = horizontalPosition - splitContainer.current.offsetLeft
    const newRelativeSize = horizontalPositionInSplitContainer / splitContainer.current.clientWidth
    setRelativeSplitValue(newRelativeSize * 100)
    moveEvent.preventDefault()
  }, [])

  useBindPointerMovementEventOnWindow(onMove, onStopResizing)

  return (
    <div ref={splitContainer} className={`flex-fill flex-row d-flex ${additionalContainerClassName || ''}`}>
      <div
        className={`${styles['splitter']} ${styles['left']} ${!showLeft ? 'd-none' : ''}`}
        style={{ width: `calc(${adjustedRelativeSplitValue}% - 5px)` }}>
        {left}
      </div>
      <ShowIf condition={showLeft && showRight}>
        <div className={`${styles['splitter']} ${styles['separator']}`}>
          <SplitDivider onGrab={onStartResizing} />
        </div>
      </ShowIf>
      <div
        className={`${styles['splitter']}${!showRight ? ' d-none' : ''}`}
        style={{ width: `calc(100% - ${adjustedRelativeSplitValue}%)` }}>
        {right}
      </div>
    </div>
  )
}
