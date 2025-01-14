/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Button } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import Link from 'next/link'

/**
 * A button that links to the public explore page.
 */
export const ExploreButton: React.FC = () => {
  useTranslation()

  return (
    <Link href={'/explore/public'}>
      <Button variant={'secondary'} size={'sm'}>
        <Trans i18nKey='explore.modes.public' />
      </Button>
    </Link>
  )
}
