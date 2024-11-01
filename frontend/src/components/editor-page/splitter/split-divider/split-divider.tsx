/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { concatCssClasses } from '../../../../utils/concat-css-classes'
import { testId } from '../../../../utils/test-id'
import { UiIcon } from '../../../common/icons/ui-icon'
import styles from './split-divider.module.scss'
import React, { useMemo } from 'react'
import { Button } from 'react-bootstrap'
import {
  ArrowLeft as IconArrowLeft,
  ArrowLeftRight as IconArrowLeftRight,
  ArrowRight as IconArrowRight
} from 'react-bootstrap-icons'

export enum DividerButtonsShift {
  SHIFT_TO_LEFT = 'shift-left',
  SHIFT_TO_RIGHT = 'shift-right',
  NO_SHIFT = ''
}

export interface SplitDividerProps {
  onGrab: () => void
  onLeftButtonClick: () => void
  onRightButtonClick: () => void
  forceOpen: boolean
  focusLeft: boolean
  focusRight: boolean
  dividerButtonsShift: DividerButtonsShift
}

/**
 * Renders the divider between the two editor panes.
 * This divider supports both mouse and touch interactions.
 *
 * @param onGrab callback that is triggered if the splitter is grabbed.
 * @param onLeftButtonClick callback that is triggered when the left arrow button is pressed
 * @param onRightButtonClick callback that is triggered when the right arrow button is pressed
 * @param dividerShift defines if the buttons should be shifted to the left or right side
 * @param focusLeft defines if the left button should be focused
 * @param focusRight defines if the right button should be focused
 * @param forceOpen defines if the arrow buttons should always be visible
 */
export const SplitDivider: React.FC<SplitDividerProps> = ({
  onGrab,
  onLeftButtonClick,
  onRightButtonClick,
  dividerButtonsShift,
  focusLeft,
  focusRight,
  forceOpen
}) => {
  const className = useMemo(() => {
    return concatCssClasses(styles.middle, {
      [styles.open]: forceOpen,
      [styles[dividerButtonsShift]]: dividerButtonsShift !== DividerButtonsShift.NO_SHIFT
    })
  }, [dividerButtonsShift, forceOpen])

  return (
    <div className={styles.divider} {...testId('splitter-divider')} id={'editor-splitter'}>
      <div className={className}>
        <div className={styles.buttons}>
          <Button variant={focusLeft ? 'secondary' : 'light'} onClick={onLeftButtonClick}>
            <UiIcon icon={IconArrowLeft} />
          </Button>
          <span onMouseDown={onGrab} onTouchStart={onGrab} className={styles['grabber']}>
            <UiIcon icon={IconArrowLeftRight} />
          </span>
          <Button variant={focusRight ? 'secondary' : 'light'} onClick={onRightButtonClick}>
            <UiIcon icon={IconArrowRight} />
          </Button>
        </div>
      </div>
    </div>
  )
}
