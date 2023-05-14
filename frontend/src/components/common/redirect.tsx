/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Logger } from '../../utils/logger'
import { testId } from '../../utils/test-id'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

export interface RedirectProps {
  to: string
  replace?: boolean
}

const logger = new Logger('Redirect')

/**
 * Redirects the user to another URL. Can be external or internal.
 *
 * @param to The target URL
 * @param replace Defines if the current browser history entry should be replaced or not
 */
export const Redirect: React.FC<RedirectProps> = ({ to, replace }) => {
  const router = useRouter()

  useEffect(() => {
    ;(replace ? router.replace(to) : router.push(to)).catch((error: Error) => {
      logger.error(`Error while redirecting to ${to}`, error)
    })
  }, [replace, router, to])

  return (
    <span {...testId('redirect')}>
      Redirecting to <Link href={to}>{to}</Link>
    </span>
  )
}
