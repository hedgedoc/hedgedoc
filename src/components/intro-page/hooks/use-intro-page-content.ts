/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchFrontPageContent } from '../requests'
import { useCustomizeAssetsUrl } from '../../../hooks/common/use-customize-assets-url'

export const useIntroPageContent = (): string[] | undefined => {
  const { t } = useTranslation()
  const [content, setContent] = useState<string[] | undefined>(undefined)
  const customizeAssetsUrl = useCustomizeAssetsUrl()

  useEffect(() => {
    fetchFrontPageContent(customizeAssetsUrl)
      .then((content) => setContent(content.split('\n')))
      .catch(() => setContent(undefined))
  }, [customizeAssetsUrl, t])

  return content
}
