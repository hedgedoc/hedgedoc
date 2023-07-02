/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Button } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import Link from 'next/link'

/**
 * A button that links to the history page.
 */
export const HistoryButton: React.FC = () => {
  useTranslation()

  return (
    <Link href={'/history'}>
      <Button variant={'secondary'} size={'sm'}>
        <Trans i18nKey='landing.navigation.history' />
      </Button>
    </Link>
  )
}
