import React from 'react'
import { ButtonProps } from 'react-bootstrap'
import { IconProp } from '../../utils/iconProp'
import { IconButton } from '../icon-button/icon-button'

export enum SortModeEnum {
    up = 1,
    down = -1,
    no = 0
}

const getIcon = (direction: SortModeEnum): IconProp => {
  switch (direction) {
    default:
    case SortModeEnum.no:
      return 'sort'
    case SortModeEnum.up:
      return 'sort-up'
    case SortModeEnum.down:
      return 'sort-down'
  }
}

export interface SortButtonProps extends ButtonProps {
    onChange: (direction: SortModeEnum) => void
    direction: SortModeEnum
}

const toggleDirection = (direction: SortModeEnum) => {
  switch (direction) {
    case SortModeEnum.no:
      return SortModeEnum.up
    case SortModeEnum.up:
      return SortModeEnum.down
    default:
    case SortModeEnum.down:
      return SortModeEnum.no
  }
}

export const SortButton: React.FC<SortButtonProps> = ({ children, variant, onChange, direction }) => {
  const toggleSort = () => {
    onChange(toggleDirection(direction))
  }

  return <IconButton onClick={toggleSort} variant={variant} icon={getIcon(direction)}>{children}</IconButton>
}
