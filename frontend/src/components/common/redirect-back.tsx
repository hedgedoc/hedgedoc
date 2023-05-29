/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

/**
 * Redirects the user back to the previous URL.
 */
export const RedirectBack: React.FC = () => {
  const router = useRouter()

  useEffect(() => {
    router.back()
  })

  return <span>Redirecting back</span>
}
