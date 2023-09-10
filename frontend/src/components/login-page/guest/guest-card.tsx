/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Card } from 'react-bootstrap'
import { NewNoteButton } from '../../common/new-note-button/new-note-button'
import { HistoryButton } from '../../layout/app-bar/app-bar-elements/help-dropdown/history-button'
import { useFrontendConfig } from '../../common/frontend-config-context/use-frontend-config'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders the card with the options for not logged-in users.
 */
export const GuestCard: React.FC = () => {
  const allowAnonymous = useFrontendConfig().allowAnonymous

  useTranslation()

  if (!allowAnonymous) {
    return null
  }

  return (
    <Card>
      <Card.Body>
        <Card.Title>
          <Trans i18nKey={'login.guest.title'}></Trans>
        </Card.Title>
        <div className={'d-flex flex-row gap-2'}>
          <NewNoteButton />
          <HistoryButton />
        </div>
      </Card.Body>
    </Card>
  )
}
