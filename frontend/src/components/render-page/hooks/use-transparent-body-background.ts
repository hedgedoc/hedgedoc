/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect } from 'react'

/**
 * Makes the HTML body transparent.
 */
export const useTransparentBodyBackground = () => {
  useEffect(() => {
    document.body.classList.add('bg-transparent')
    return () => document.body.classList.remove('bg-transparent')
  }, [])
}
