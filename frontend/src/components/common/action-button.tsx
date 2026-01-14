/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { Button, type ButtonProps } from 'react-bootstrap'
import { UiIcon } from './icons/ui-icon'
import { ArrowRepeat } from 'react-bootstrap-icons'

export interface ActionButtonProps extends ButtonProps {
  loading?: boolean
}

/**
 * An ActionButton enhances a normal button by adding a loading spinner when performing an action.
 * The loading spinner can be set using the `loading` prop.
 */
export const ActionButton: React.FC<ActionButtonProps> = ({ loading, children, ...props }) => {
  return (
    <Button {...props} disabled={props.disabled ?? loading}>
      {loading ? <UiIcon icon={ArrowRepeat} spin={true} /> : children}
    </Button>
  )
}
