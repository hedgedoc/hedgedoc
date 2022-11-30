/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ForkAwesomeIcon } from '../fork-awesome/fork-awesome-icon'
import type { IconName } from '../fork-awesome/types'
import { ShowIf } from '../show-if/show-if'
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
export const InternalLink: React.FC<LinkWithTextProps> = ({
  href,
  text,
  icon,
  id,
  className = 'text-light',
  title
}) => {
  return (
    <Link href={href}>
      <a className={className} id={id} title={title}>
        <ShowIf condition={!!icon}>
          <ForkAwesomeIcon icon={icon as IconName} fixedWidth={true} />
          &nbsp;
        </ShowIf>
        {text}
      </a>
    </Link>
  )
}
