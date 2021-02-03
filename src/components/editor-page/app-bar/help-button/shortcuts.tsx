/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react'
import { Card, ListGroup, Row } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import { isMac } from '../../utils'

export const Shortcut: React.FC = () => {
  const modifierKey = isMac ? <kbd>⌘</kbd> : <kbd>Ctrl</kbd>
  const altKey = isMac ? <kbd>⌥</kbd> : <kbd>Alt</kbd>

  const shortcutMap: { [category: string]: { [functionName: string]: JSX.Element[] } } = {
    'View Mode': {
      'editor.help.shortcuts.view': [<kbd>Ctrl</kbd>, <> + </>, altKey, <> + </>, <kbd>V</kbd>],
      'editor.help.shortcuts.both': [<kbd>Ctrl</kbd>, <> + </>, altKey, <> + </>, <kbd>B</kbd>],
      'editor.help.shortcuts.edit': [<kbd>Ctrl</kbd>, <> + </>, altKey, <> + </>, <kbd>E</kbd>]
    },
    Editor: {
      'editor.help.shortcuts.bold': [modifierKey, <> + </>, <kbd>B</kbd>],
      'editor.help.shortcuts.italic': [modifierKey, <> + </>, <kbd>I</kbd>],
      'editor.help.shortcuts.underline': [modifierKey, <> + </>, <kbd>U</kbd>],
      'editor.help.shortcuts.strikethrough': [modifierKey, <> + </>, <kbd>D</kbd>],
      'editor.help.shortcuts.mark': [modifierKey, <> + </>, <kbd>M</kbd>],
      'editor.help.shortcuts.link': [modifierKey, <> + </>, <kbd>K</kbd>]
    }
  }
  return (
    <Row className={ 'justify-content-center pt-4' }>
      { Object.keys(shortcutMap)
              .map(category => {
                return (
                  <Card key={ category } className={ 'm-2 w-50' }>
                    <Card.Header>{ category }</Card.Header>
                    <ListGroup variant="flush">
                      { Object.entries(shortcutMap[category])
                              .map(([functionName, shortcuts]) => {
                                return (
                                  <ListGroup.Item key={ functionName } className={ 'd-flex justify-content-between' }>
                                    <span><Trans i18nKey={ functionName }/></span>
                                    <span>
                      {
                        shortcuts.map((shortcut, shortcutIndex) =>
                          <Fragment key={ shortcutIndex }>{ shortcut }</Fragment>)
                      }
                    </span>
                                  </ListGroup.Item>
                                )
                              }) }
                    </ListGroup>
                  </Card>)
              })
      }
    </Row>
  )
}
