/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { BackendVersion } from '../../../../api/config/types'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import links from '../../../../links.json'
import { cypressId } from '../../../../utils/cypress-attribute'
import frontendVersion from '../../../../version.json'
import type { CommonModalProps } from '../../../common/modals/common-modal'
import { CommonModal } from '../../../common/modals/common-modal'
import { VersionInfoModalColumn } from './version-info-modal-column'
import React, { useMemo } from 'react'
import { Modal, Row } from 'react-bootstrap'

/**
 * Renders a modal with the version information.
 *
 * @param onHide The callback to call if the modal should be closed
 * @param show If the modal should be shown.
 */
export const VersionInfoModal: React.FC<CommonModalProps> = ({ onHide, show }) => {
  const serverVersion: BackendVersion = useApplicationState((state) => state.config.version)
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
        <Row>
          <VersionInfoModalColumn
            titleI18nKey={'landing.versionInfo.serverVersion'}
            version={backendVersion}
            issueTrackerLink={links.backendIssues}
            sourceCodeLink={links.backendSourceCode}
          />
          <VersionInfoModalColumn
            titleI18nKey={'landing.versionInfo.clientVersion'}
            version={frontendVersion.version}
            issueTrackerLink={frontendVersion.issueTrackerUrl}
            sourceCodeLink={frontendVersion.sourceCodeUrl}
          />
        </Row>
      </Modal.Body>
    </CommonModal>
  )
}
