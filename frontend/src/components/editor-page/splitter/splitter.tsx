/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts'
import { DividerButtonsShift, SplitDivider } from './split-divider/split-divider'
import styles from './splitter.module.scss'
import type { MouseEvent, ReactElement, TouchEvent } from 'react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { setEditorSplitPosition } from '../../../redux/editor-config/methods'

export interface SplitterProps {
  left?: ReactElement
  right?: ReactElement
  additionalContainerClassName?: string
}

/**
 * Checks if the given {@link Event} is a {@link MouseEvent}.
 *
 * @param event the event to check
 * @return {@link true} if the given event is a {@link MouseEvent}
 */
const isMouseEvent = (event: MouseEvent | TouchEvent): event is MouseEvent => {
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

const SNAP_PERCENTAGE = 10

/**
 * Creates a Left/Right splitter react component.
 *
 * @param additionalContainerClassName css classes that are added to the split container.
 * @param left the react component that should be shown on the left side.
 * @param right the react component that should be shown on the right side.
 * @return the created component
 */
export const Splitter: React.FC<SplitterProps> = ({ additionalContainerClassName, left, right }) => {
  const relativeSplitValue = useApplicationState((state) => state.editorConfig.splitPosition)
  const [resizingInProgress, setResizingInProgress] = useState(false)
  const adjustedRelativeSplitValue = useMemo(() => Math.min(100, Math.max(0, relativeSplitValue)), [relativeSplitValue])
  const splitContainer = useRef<HTMLDivElement>(null)

  /**
   * Starts the splitter resizing.
   */
  const onStartResizing = useCallback(() => {
    setResizingInProgress(true)
  }, [])

  /**
   * Stops the splitter resizing.
   */
  const onStopResizing = useCallback(() => {
    setResizingInProgress(false)
  }, [])

  /**
   * Moves the splitter to the left or right side if the relative split value is close to the edges.
   */
  useEffect(() => {
    if (!resizingInProgress) {
      if (relativeSplitValue < SNAP_PERCENTAGE && relativeSplitValue > 0) {
        setEditorSplitPosition(0)
      }
      if (relativeSplitValue > 100 - SNAP_PERCENTAGE && relativeSplitValue < 100) {
        setEditorSplitPosition(100)
      }
    }
  }, [resizingInProgress, relativeSplitValue])

  /**
   * Recalculates the panel split based on the absolute mouse/touch position.
   *
   * @param moveEvent is a {@link MouseEvent} or {@link TouchEvent} that got triggered.
   */
  const onMove = useCallback((moveEvent: MouseEvent | TouchEvent) => {
    if (!splitContainer.current) {
      return
    }
    if (isMouseEvent(moveEvent) && !isLeftMouseButtonClicked(moveEvent)) {
      setResizingInProgress(false)
      moveEvent.preventDefault()
      return undefined
    }

    const horizontalPosition = extractHorizontalPosition(moveEvent)
    if (horizontalPosition === undefined) {
      return
    }
    const horizontalPositionInSplitContainer = horizontalPosition - splitContainer.current.offsetLeft
    const newRelativeSize = horizontalPositionInSplitContainer / splitContainer.current.clientWidth
    const number = newRelativeSize * 100
    setEditorSplitPosition(number)
    moveEvent.preventDefault()
  }, [])

  const onLeftButtonClick = useCallback(() => {
    setEditorSplitPosition(relativeSplitValue === 100 ? 50 : 0)
  }, [relativeSplitValue])

  const onRightButtonClick = useCallback(() => {
    setEditorSplitPosition(relativeSplitValue === 0 ? 50 : 100)
  }, [relativeSplitValue])

  const dividerButtonsShift = useMemo(() => {
    if (relativeSplitValue === 0) {
      return DividerButtonsShift.SHIFT_TO_RIGHT
    } else if (relativeSplitValue === 100) {
      return DividerButtonsShift.SHIFT_TO_LEFT
    } else {
      return DividerButtonsShift.NO_SHIFT
    }
  }, [relativeSplitValue])

  useKeyboardShortcuts()

  return (
    <div
      ref={splitContainer}
      className={`flex-fill flex-row d-flex ${additionalContainerClassName || ''}${
        resizingInProgress ? ' ' + styles.resizing : ''
      }`}>
      {resizingInProgress && (
        <div
          className={styles['move-overlay']}
          onTouchMove={onMove}
          onMouseMove={onMove}
          onTouchCancel={onStopResizing}
          onTouchEnd={onStopResizing}
          onMouseUp={onStopResizing}></div>
      )}
      <div
        id={'editor-edit-pane'}
        className={styles['left']}
        style={{ width: `calc(${adjustedRelativeSplitValue}% - 5px)` }}>
        <div className={styles['inner']}>{left}</div>
      </div>
      <SplitDivider
        onGrab={onStartResizing}
        onLeftButtonClick={onLeftButtonClick}
        onRightButtonClick={onRightButtonClick}
        forceOpen={resizingInProgress}
        focusLeft={relativeSplitValue < SNAP_PERCENTAGE}
        focusRight={relativeSplitValue > 100 - SNAP_PERCENTAGE}
        dividerButtonsShift={dividerButtonsShift}
      />
      <div
        id={'editor-view-pane'}
        className={styles['right']}
        style={{ width: `calc(100% - ${adjustedRelativeSplitValue}%)` }}>
        <div className={styles['inner']}>{right}</div>
      </div>
    </div>
  )
}
