/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { IconName } from '../../common/fork-awesome/types'
import { IconButton } from '../../common/icon-button/icon-button'
import React from 'react'
import type { ButtonProps } from 'react-bootstrap'

export enum SortModeEnum {
  up = 1,
  down = -1,
  no = 0
}

/**
 * Returns the proper icon for the given sorting direction.
 *
 * @param direction The sorting direction for which to get the icon
 * @return The name of the icon fitting to the given sorting direction
 */
const getIcon = (direction: SortModeEnum): IconName => {
  switch (direction) {
    case SortModeEnum.no:
      return 'sort'
    case SortModeEnum.up:
      return 'sort-asc'
    case SortModeEnum.down:
      return 'sort-desc'
    default:
      return 'sort'
  }
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
export const SortButton: React.FC<SortButtonProps> = ({ children, variant, onDirectionChange, direction }) => {
  const toggleSort = () => {
    onDirectionChange(toggleDirection(direction))
  }

  return (
    <IconButton onClick={toggleSort} variant={variant} icon={getIcon(direction)} border={true}>
      {children}
    </IconButton>
  )
}
