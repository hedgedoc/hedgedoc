/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useMemo } from 'react'
import { Card, ListGroup, Row } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import { isMac } from '../../utils'

/**
 * Renders a list of shortcuts usable in HedgeDoc.
 */
export const ShortcutTabContent: React.FC = () => {
  const modifierKey = useMemo(() => (isMac() ? <kbd>⌘</kbd> : <kbd>Ctrl</kbd>), [])
  const altKey = useMemo(() => (isMac() ? <kbd>⌥</kbd> : <kbd>Alt</kbd>), [])

  const shortcutMap: { [category: string]: { [functionName: string]: JSX.Element[] } } = {
    'View Mode': {
      'editor.help.shortcuts.view': [<kbd key={'ctrl'}>Ctrl</kbd>, <> + </>, altKey, <> + </>, <kbd key={'v'}>V</kbd>],
      'editor.help.shortcuts.both': [<kbd key={'ctrl'}>Ctrl</kbd>, <> + </>, altKey, <> + </>, <kbd key={'b'}>B</kbd>],
      'editor.help.shortcuts.edit': [<kbd key={'ctrl'}>Ctrl</kbd>, <> + </>, altKey, <> + </>, <kbd key={'e'}>E</kbd>]
    },
    Editor: {
      'editor.help.shortcuts.bold': [modifierKey, <> + </>, <kbd key={'b'}>B</kbd>],
      'editor.help.shortcuts.italic': [modifierKey, <> + </>, <kbd key={'i'}>I</kbd>],
      'editor.help.shortcuts.underline': [modifierKey, <> + </>, <kbd key={'u'}>U</kbd>],
      'editor.help.shortcuts.strikethrough': [modifierKey, <> + </>, <kbd key={'d'}>D</kbd>],
      'editor.help.shortcuts.mark': [modifierKey, <> + </>, <kbd key={'m'}>M</kbd>],
      'editor.help.shortcuts.link': [modifierKey, <> + </>, <kbd key={'k'}>K</kbd>]
    }
  }
  return (
    <Row className={'justify-content-center pt-4'}>
      {Object.keys(shortcutMap).map((category) => {
        return (
          <Card key={category} className={'m-2 w-50'}>
            <Card.Header>{category}</Card.Header>
            <ListGroup variant='flush'>
              {Object.entries(shortcutMap[category]).map(([functionName, shortcuts]) => {
                return (
                  <ListGroup.Item key={functionName} className={'d-flex justify-content-between'}>
                    <span>
                      <Trans i18nKey={functionName} />
                    </span>
                    <span>
                      {shortcuts.map((shortcut, shortcutIndex) => (
                        <Fragment key={shortcutIndex}>{shortcut}</Fragment>
                      ))}
                    </span>
                  </ListGroup.Item>
                )
              })}
            </ListGroup>
          </Card>
        )
      })}
    </Row>
  )
}
