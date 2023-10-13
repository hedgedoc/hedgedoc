/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { testId } from '../../../../utils/test-id'
import { SettingsToggleButton } from './settings-toggle-button'
import React, { useCallback, useMemo } from 'react'
import { ToggleButtonGroup } from 'react-bootstrap'

enum OnOffState {
  ON,
  OFF
}

export interface OnOffButtonGroupProps {
  value: boolean
  onSelect: (value: boolean) => void
  name: string
  overrideButtonOnI18nKey?: string
  overrideButtonOffI18nKey?: string
}

/**
 * Shows a button group that is used to toggle a setting on or off.
 *
 * @param onSelect callback that is executed if the on/off value has changed
 * @param value the current on/off value that should be visible
 * @param name A unique name for the button group to allow the browser to distinguish between multiple ones
 * @param overrideButtonOnI18nKey Set to override the i18n key for the on-button
 * @param overrideButtonOffI18nKey Set to override the i18n key for the off-button
 */
export const OnOffButtonGroup: React.FC<OnOffButtonGroupProps> = ({
  onSelect,
  value,
  name,
  overrideButtonOffI18nKey,
  overrideButtonOnI18nKey
}) => {
  const buttonGroupValue = useMemo(() => (value ? OnOffState.ON : OnOffState.OFF), [value])
  const onButtonSelect = useCallback(
    (value: OnOffState) => {
      onSelect(value === OnOffState.ON)
    },
    [onSelect]
  )

  return (
    <ToggleButtonGroup type='radio' name={name} value={buttonGroupValue}>
      <SettingsToggleButton
        onSelect={onButtonSelect}
        selected={buttonGroupValue === OnOffState.ON}
        value={OnOffState.ON}
        i18nKeyTooltip={overrideButtonOnI18nKey ?? 'common.on'}
        i18nKeyLabel={overrideButtonOnI18nKey ?? 'common.on'}
        {...testId('onOffButtonGroupOn')}
      />
      <SettingsToggleButton
        onSelect={onButtonSelect}
        selected={buttonGroupValue === OnOffState.OFF}
        value={OnOffState.OFF}
        i18nKeyTooltip={overrideButtonOffI18nKey ?? 'common.off'}
        i18nKeyLabel={overrideButtonOffI18nKey ?? 'common.off'}
        {...testId('onOffButtonGroupOff')}
      />
    </ToggleButtonGroup>
  )
}
