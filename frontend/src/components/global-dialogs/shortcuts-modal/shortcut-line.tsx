/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AltKey } from './alt-key'
import { ModifierKey } from './modifier-key'
import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

interface ShortcutLineProps {
  functionNameI18nKey: string
  showModifierKey: boolean
  showAltKey: boolean
  functionKeyCode: string
}

/**
 * Renders one shortcut hint for the modal
 *
 * @param functionNameI18nKey The i18n key of the function name that is associated to the shortcut
 * @param showAltKey Defines if the shortcut requires the alt/option key
 * @param showModifierKey Defines if the shortcut requires the control/command key
 * @param functionKeyCode The actual key of the shortcut
 */
export const ShortcutLine: React.FC<ShortcutLineProps> = ({
  functionNameI18nKey,
  showAltKey,
  showModifierKey,
  functionKeyCode
}) => {
  useTranslation()

  return (
    <ListGroup.Item className={'d-flex justify-content-between'}>
      <span>
        <Trans i18nKey={functionNameI18nKey} />
      </span>
      <span>
        {showModifierKey && (
          <>
            <ModifierKey />
            <span> + </span>
          </>
        )}

        {showAltKey && (
          <>
            <AltKey />
            <span> + </span>
          </>
        )}

        <kbd>{functionKeyCode.toUpperCase()}</kbd>
      </span>
    </ListGroup.Item>
  )
}
