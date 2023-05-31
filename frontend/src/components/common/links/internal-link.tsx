/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UiIcon } from '../icons/ui-icon'
import type { LinkWithTextProps } from './types'
import Link from 'next/link'
import React from 'react'

/**
 * An internal link.
 * This should be used for linking pages of the HedgeDoc instance.
 *
 * @param href The links location
 * @param text The links text
 * @param icon An optional icon to be shown before the links text
 * @param id An id for the link object
 * @param className Additional class names added to the link object
 * @param title The title of the link
 */
export const InternalLink: React.FC<LinkWithTextProps> = ({ href, text, icon, id, className = '', title }) => {
  return (
    <Link href={href} className={className} id={id} title={title}>
      <UiIcon icon={icon} nbsp={true} />
      {text}
    </Link>
  )
}
