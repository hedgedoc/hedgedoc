/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Alert } from 'react-bootstrap'
import { Trans } from 'react-i18next'

/**
 * Renders a warning when the user tries to open the print dialog from the browser.
 */
export const PrintWarning: React.FC = () => {
  return (
    <div className={'d-none d-print-block'}>
      <Alert variant={'warning'}>
        <Alert.Heading>
          <Trans i18nKey={'print.warning.title'} />
        </Alert.Heading>
        <p>
          <Trans i18nKey={'print.warning.text'} />
        </p>
      </Alert>
    </div>
  )
}
