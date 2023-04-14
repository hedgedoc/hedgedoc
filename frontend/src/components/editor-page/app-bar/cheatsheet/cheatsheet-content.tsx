/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { allAppExtensions } from '../../../../extensions/all-app-extensions'
import type { CheatsheetEntry, CheatsheetExtension } from '../../cheatsheet/cheatsheet-extension'
import { isCheatsheetGroup } from '../../cheatsheet/cheatsheet-extension'
import { CategoryAccordion } from './category-accordion'
import { CheatsheetEntryPane } from './cheatsheet-entry-pane'
import { TopicSelection } from './topic-selection'
import React, { useCallback, useMemo, useState } from 'react'
import { Col, ListGroup, Row } from 'react-bootstrap'
import { Trans } from 'react-i18next'

/**
 * Renders the tab content for the cheatsheet.
 */
export const CheatsheetContent: React.FC = () => {
  const [selectedExtension, setSelectedExtension] = useState<CheatsheetExtension>()
  const [selectedEntry, setSelectedEntry] = useState<CheatsheetEntry>()

  const changeExtension = useCallback((value: CheatsheetExtension) => {
    setSelectedExtension(value)
    setSelectedEntry(isCheatsheetGroup(value) ? value.entries[0] : value)
  }, [])

  const extensions = useMemo(() => allAppExtensions.flatMap((extension) => extension.buildCheatsheetExtensions()), [])

  return (
    <Row className={`mt-2`}>
      <Col xs={3}>
        <CategoryAccordion extensions={extensions} selectedEntry={selectedExtension} onStateChange={changeExtension} />
      </Col>
      <Col xs={9}>
        <ListGroup>
          <TopicSelection
            extension={selectedExtension}
            selectedEntry={selectedEntry}
            setSelectedEntry={setSelectedEntry}
          />
          {selectedEntry !== undefined ? (
            <CheatsheetEntryPane
              rootI18nKey={isCheatsheetGroup(selectedExtension) ? selectedExtension.i18nKey : undefined}
              extension={selectedEntry}
            />
          ) : (
            <span>
              <Trans i18nKey={'cheatsheet.modal.noSelection'}></Trans>
            </span>
          )}
        </ListGroup>
      </Col>
    </Row>
  )
}
