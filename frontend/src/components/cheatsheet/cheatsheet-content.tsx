/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CategoryAccordion } from './category-accordion'
import { CheatsheetEntryPane } from './cheatsheet-entry-pane'
import type { CheatsheetExtension, CheatsheetEntry } from './cheatsheet-extension'
import { isCheatsheetMultiEntry } from './cheatsheet-extension'
import { CheatsheetSearch } from './cheatsheet-search'
import styles from './cheatsheet.module.scss'
import { TopicSelection } from './topic-selection'
import React, { useCallback, useState } from 'react'
import { Col, ListGroup, Row } from 'react-bootstrap'
import { Trans } from 'react-i18next'

/**
 * Renders the tab content for the cheatsheet.
 */
export const CheatsheetContent: React.FC = () => {
  const [visibleExtensions, setVisibleExtensions] = useState<CheatsheetExtension[]>([])
  const [selectedExtension, setSelectedExtension] = useState<CheatsheetExtension>()
  const [selectedEntry, setSelectedEntry] = useState<CheatsheetEntry>()

  const changeExtension = useCallback((value: CheatsheetExtension) => {
    setSelectedExtension(value)
    setSelectedEntry(isCheatsheetMultiEntry(value) ? value.topics[0] : value)
  }, [])

  return (
    <Row className={`mt-2`}>
      <Col xs={3} className={styles.sidebar}>
        <CheatsheetSearch setVisibleExtensions={setVisibleExtensions} />
        <CategoryAccordion
          extensions={visibleExtensions}
          selectedEntry={selectedExtension}
          onStateChange={changeExtension}
        />
      </Col>
      <Col xs={9}>
        <ListGroup>
          <TopicSelection
            extension={selectedExtension}
            selectedEntry={selectedEntry}
            setSelectedEntry={setSelectedEntry}
          />
          {selectedEntry !== undefined && selectedExtension !== undefined ? (
            <CheatsheetEntryPane
              i18nKeyPrefix={isCheatsheetMultiEntry(selectedExtension) ? selectedExtension.i18nKey : undefined}
              entry={selectedEntry}
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
