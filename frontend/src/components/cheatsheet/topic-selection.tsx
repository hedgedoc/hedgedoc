/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension, CheatsheetEntry } from './cheatsheet-extension'
import { isCheatsheetMultiEntry } from './cheatsheet-extension'
import React, { useMemo } from 'react'
import { Button, ButtonGroup, ListGroupItem } from 'react-bootstrap'
import { Trans } from 'react-i18next'

interface EntrySelectionProps {
  extension: CheatsheetExtension | undefined
  selectedEntry: CheatsheetEntry | undefined
  setSelectedEntry: (value: CheatsheetEntry) => void
}

/**
 * Renders a button group that contains the topics of the given extension.
 * If the extension has no topics then the selection won't be displayed.
 *
 * @param extension The extension whose topics should be displayed
 * @param selectedEntry The currently selected cheatsheet entry that should be displayed as active
 * @param setSelectedEntry A callback that should be executed if a new topic has been selected
 */
export const TopicSelection: React.FC<EntrySelectionProps> = ({ extension, selectedEntry, setSelectedEntry }) => {
  const listItems = useMemo(() => {
    if (!isCheatsheetMultiEntry(extension)) {
      return null
    }
    return extension.topics.map((entry) => (
      <Button
        key={entry.i18nKey}
        variant={selectedEntry?.i18nKey === entry.i18nKey ? 'primary' : 'outline-primary'}
        onClick={() => setSelectedEntry(entry)}>
        <Trans i18nKey={`cheatsheet.${extension.i18nKey}.${entry.i18nKey}.title`}></Trans>
      </Button>
    ))
  }, [extension, selectedEntry?.i18nKey, setSelectedEntry])

  return !listItems ? null : (
    <ListGroupItem>
      <h4>
        <Trans i18nKey={'cheatsheet.modal.headlines.selectTopic'} />
      </h4>
      <ButtonGroup className={'mb-2'}>{listItems}</ButtonGroup>
    </ListGroupItem>
  )
}
