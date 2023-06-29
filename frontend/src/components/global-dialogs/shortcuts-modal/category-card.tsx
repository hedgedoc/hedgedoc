/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Card, ListGroup } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

interface CategoryProps extends PropsWithChildren {
  headerI18nKey: string
}

/**
 * Renders a group of shortcut lines
 *
 * @param headerI18nKey The i18n key of the header
 * @param children The lines to include
 */
export const CategoryCard: React.FC<CategoryProps> = ({ headerI18nKey, children }) => {
  useTranslation()

  return (
    <Card key={headerI18nKey} className={'mb-4'}>
      <Card.Header>
        <Trans i18nKey={headerI18nKey} />
      </Card.Header>
      <ListGroup variant='flush'>{children}</ListGroup>
    </Card>
  )
}
