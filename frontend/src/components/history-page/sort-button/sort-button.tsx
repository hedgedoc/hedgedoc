/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IconButton } from '../../common/icon-button/icon-button'
import React, { useCallback, useMemo } from 'react'
import type { ButtonProps } from 'react-bootstrap'
import { SortAlphaDown as IconSortAlphaDown, SortAlphaUp as IconSortAlphaUp, X as IconX } from 'react-bootstrap-icons'

export enum SortModeEnum {
  up = 1,
  down = -1,
  no = 0
}

export interface SortButtonProps extends ButtonProps {
  onDirectionChange: (direction: SortModeEnum) => void
  direction: SortModeEnum
}

/**
 * Switches the sorting direction based on the previous direction.
 *
 * @param direction The previous sorting direction
 * @return The new sorting direction
 */
const toggleDirection = (direction: SortModeEnum) => {
  switch (direction) {
    case SortModeEnum.no:
      return SortModeEnum.up
    case SortModeEnum.up:
      return SortModeEnum.down
    case SortModeEnum.down:
    default:
      return SortModeEnum.no
  }
}

/**
 * Renders a button to change the sorting order of a list.
 *
 * @param children The children elements that should be rendered inside the button
 * @param variant The variant of the button
 * @param onDirectionChange Callback that is fired when the sorting direction is changed
 * @param direction The sorting direction that is used
 */
export const SortButton: React.FC<SortButtonProps> = ({ children, onDirectionChange, direction }) => {
  const toggleSort = useCallback(() => {
    onDirectionChange(toggleDirection(direction))
  }, [direction, onDirectionChange])

  const icon = useMemo(() => {
    switch (direction) {
      case SortModeEnum.down:
        return IconSortAlphaDown
      case SortModeEnum.up:
        return IconSortAlphaUp
      case SortModeEnum.no:
        return IconX
    }
  }, [direction])

  return (
    <IconButton onClick={toggleSort} variant={'secondary'} icon={icon} iconSize={1.5} border={true}>
      {children}
    </IconButton>
  )
}
