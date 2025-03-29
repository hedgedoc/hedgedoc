/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ServerVersionDto } from '@hedgedoc/commons'
import links from '../../../links.json'
import { cypressId } from '../../../utils/cypress-attribute'
import { CopyableField } from '../../common/copyable/copyable-field/copyable-field'
import { useFrontendConfig } from '../../common/frontend-config-context/use-frontend-config'
import { TranslatedExternalLink } from '../../common/links/translated-external-link'
import type { CommonModalProps } from '../../common/modals/common-modal'
import { CommonModal } from '../../common/modals/common-modal'
import React, { useMemo } from 'react'
import { Modal } from 'react-bootstrap'

/**
 * Renders a modal with the version information.
 *
 * @param onHide The callback to call if the modal should be closed
 * @param show If the modal should be shown.
 */
export const VersionInfoModal: React.FC<CommonModalProps> = ({ onHide, show }) => {
  const serverVersion: ServerVersionDto = useFrontendConfig().version
  const backendVersion = useMemo(() => {
    const version = `${serverVersion.major}.${serverVersion.minor}.${serverVersion.patch}`

    if (serverVersion.preRelease) {
      return `${version}-${serverVersion.preRelease}`
    }

    if (serverVersion.commit) {
      return serverVersion.commit
    }
    return version
  }, [serverVersion])

  return (
    <CommonModal
      {...cypressId('version-modal')}
      show={show}
      onHide={onHide}
      showCloseButton={true}
      titleI18nKey={'landing.versionInfo.title'}>
      <Modal.Body>
        <CopyableField content={backendVersion} />
        <div className='d-flex justify-content-between mt-3'>
          {links.sourceCode !== undefined && (
            <TranslatedExternalLink
              i18nKey={'landing.versionInfo.sourceCode'}
              className={'btn btn-primary d-block mb-2'}
              href={links.sourceCode}
            />
          )}
          {links.issues !== undefined && (
            <TranslatedExternalLink
              i18nKey={'landing.versionInfo.issueTracker'}
              className={'btn btn-primary d-block mb-2'}
              href={links.issues}
            />
          )}
        </div>
      </Modal.Body>
    </CommonModal>
  )
}
