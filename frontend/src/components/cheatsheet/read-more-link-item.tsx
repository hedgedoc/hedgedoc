/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ExternalLink } from '../common/links/external-link'
import React from 'react'
import { ListGroupItem } from 'react-bootstrap'
import { Trans } from 'react-i18next'

export interface ReadMoreLinkGroupProps {
  url: URL | undefined
}

/**
 * Renders the read more URL as external link.
 *
 * @param url The URL to display. If the URL is undefined then nothing will be rendered.
 */
export const ReadMoreLinkItem: React.FC<ReadMoreLinkGroupProps> = ({ url }) => {
  return !url ? null : (
    <ListGroupItem>
      <h4>
        <Trans i18nKey={'cheatsheet.modal.headlines.readMoreLink'} />
      </h4>
      <ExternalLink text={url.toString()} href={url.toString()}></ExternalLink>
    </ListGroupItem>
  )
}
