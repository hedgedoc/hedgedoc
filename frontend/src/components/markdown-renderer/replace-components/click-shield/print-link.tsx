/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'

export interface PrintLinkProps {
  link: string
}

/**
 * Renders a link that is only visible in print-mode.
 * This is required as a fallback for clickshield elements.
 * @param link The link to render.
 */
export const PrintLink: React.FC<PrintLinkProps> = ({ link }) => {
  return (
    <p>
      <a className={'print-only'} href={link}>
        {link}
      </a>
    </p>
  )
}
