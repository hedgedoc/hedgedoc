/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Card } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { CopyableField } from '../common/copyable/copyable-field/copyable-field'
import type { ServerVersionInterface } from '@hedgedoc/commons'
import { useFrontendConfig } from '../common/frontend-config-context/use-frontend-config'
import { useMemo } from 'react'

/**
 * Show the current version of the software with copy button to quickly get the content.
 */
export const InstanceVersion: React.FC = () => {
  useTranslation()
  const serverVersion: ServerVersionInterface = useFrontendConfig().version
  const version = useMemo(() => {
    const version = `${serverVersion.major}.${serverVersion.minor}.${serverVersion.patch}`

    if (serverVersion.preRelease) {
      return `${version}-${serverVersion.preRelease}`
    }

    if (serverVersion.commit) {
      return `${version}-${serverVersion.commit}`
    }
    return version
  }, [serverVersion])

  return (
    <Card>
      <Card.Body>
        <Card.Title>
          <Trans i18nKey='about.versionInfo.title' />
        </Card.Title>
        <CopyableField content={version} />
      </Card.Body>
    </Card>
  )
}
