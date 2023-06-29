/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../../hooks/common/use-translated-text'
import type { PropsWithDataTestId } from '../../../../utils/test-id'
import React, { useCallback } from 'react'
import type { ButtonProps } from 'react-bootstrap'
import { Button } from 'react-bootstrap'
import { Trans } from 'react-i18next'

type DarkModeToggleButtonProps = Omit<ButtonProps, 'onSelect'> &
  PropsWithDataTestId & {
    onSelect: (value: number) => void
    selected: boolean
    value: number
    i18nKeyLabel: string
    i18nKeyTooltip: string
  }

/**
 * A button that is used in a toggle group to change settings.
 *
 * @param settingI18nKey The partial i18n key in the "settings" namespace for the setting
 * @param selected Defines if the button should be rendered as selected
 * @param onSelect Callback that is executed when the button is selected
 * @param value The value of the button that is sent back through the onSelect callback
 * @param props Other button props
 * @constructor
 */
export const SettingsToggleButton = ({
  i18nKeyLabel,
  i18nKeyTooltip,
  selected,
  onSelect,
  value,
  ...props
}: DarkModeToggleButtonProps) => {
  const title = useTranslatedText(i18nKeyTooltip)

  const onChange = useCallback(() => {
    if (!selected) {
      onSelect(value)
    }
  }, [onSelect, selected, value])

  return (
    <Button {...props} variant={selected ? 'secondary' : 'outline-secondary'} title={title} onClick={onChange}>
      <Trans i18nKey={i18nKeyLabel} />
    </Button>
  )
}
