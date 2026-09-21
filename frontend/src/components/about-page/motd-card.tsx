/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Card } from 'react-bootstrap'
import { MotdContent } from '../motd/motd-content'
import { Trans, useTranslation } from 'react-i18next'
import { EditorToRendererCommunicatorContextProvider } from '../editor-page/render-context/editor-to-renderer-communicator-context-provider'

/**
 * The card used in the about page, that shows the motd message.
 */
export const MotdCard: React.FC = () => {
  useTranslation()

  return (
    <Card>
      <Card.Body>
        <Card.Title>
          <Trans i18nKey='motd.title' />
        </Card.Title>
        <EditorToRendererCommunicatorContextProvider>
          <MotdContent />
        </EditorToRendererCommunicatorContextProvider>
      </Card.Body>
    </Card>
  )
}
