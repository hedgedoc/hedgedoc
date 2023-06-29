/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CategoryAccordion } from './category-accordion'
import { CheatsheetEntryPane } from './cheatsheet-entry-pane'
import type { CheatsheetSingleEntry, CheatsheetExtension } from './cheatsheet-extension'
import { hasCheatsheetTopics } from './cheatsheet-extension'
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
  const [selectedEntry, setSelectedEntry] = useState<CheatsheetSingleEntry>()

  const changeExtension = useCallback((value: CheatsheetExtension) => {
    setSelectedExtension(value)
    setSelectedEntry(hasCheatsheetTopics(value) ? value.topics[0] : value)
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
          {selectedEntry !== undefined ? (
            <CheatsheetEntryPane
              rootI18nKey={hasCheatsheetTopics(selectedExtension) ? selectedExtension.i18nKey : undefined}
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
