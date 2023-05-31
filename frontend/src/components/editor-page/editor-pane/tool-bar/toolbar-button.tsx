/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../utils/cypress-attribute'
import { UiIcon } from '../../../common/icons/ui-icon'
import type { PropsWithChildren, RefObject } from 'react'
import React, { useMemo } from 'react'
import { Button } from 'react-bootstrap'
import type { Icon } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

export interface ToolbarButtonProps {
  i18nKey: string
  icon: Icon
  onClick: () => void
  disabled?: boolean
  buttonRef?: RefObject<HTMLButtonElement>
}

/**
 * Renders a button for the editor toolbar.
 *
 * @param i18nKey Used to generate a title for the button by interpreting it as translation key in the i18n-namespace `editor.editorToolbar`-
 * @param iconName An icon that is shown in the button
 * @param onClick A callback that is executed on click
 * @param disabled Defines if the button is disabled
 * @param buttonRef A reference to the button element
 */
export const ToolbarButton: React.FC<PropsWithChildren<ToolbarButtonProps>> = ({
  i18nKey,
  icon,
  onClick,
  disabled = false,
  buttonRef,
  children
}) => {
  const { t } = useTranslation('', { keyPrefix: 'editor.editorToolbar' })
  const title = useMemo(() => t(i18nKey), [i18nKey, t])

  return (
    <Button
      variant={'outline-secondary'}
      className={'text-body-emphasis'}
      onClick={onClick}
      title={title}
      ref={buttonRef}
      disabled={disabled}
      {...cypressId('toolbar.' + i18nKey)}>
      <UiIcon icon={icon} />
      {children}
    </Button>
  )
}
