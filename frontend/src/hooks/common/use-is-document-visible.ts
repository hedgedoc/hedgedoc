/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react'

/**
 * Uses the browsers visiblity API to determine if the tab is active or now.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
 */
export const useIsDocumentVisible = (): boolean => {
  const [documentVisible, setDocumentVisible] = useState(true)

  useEffect(() => {
    const onFocus = () => setDocumentVisible(true)
    const onBlur = () => setDocumentVisible(false)
    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)
    return () => {
      document.removeEventListener('focus', onFocus)
      document.removeEventListener('blur', onBlur)
    }
  }, [])

  return documentVisible
}
