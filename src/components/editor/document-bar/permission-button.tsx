import React, { Fragment, useState } from 'react'
import { Trans } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { Button, Modal } from 'react-bootstrap'
import { CommonModal } from '../../common/modals/common-modal'

export const PermissionButton: React.FC = () => {
  const [showReadOnly, setShowReadOnly] = useState(false)

  return (
    <Fragment>
      <Button variant={'light'} className={'mx-1'} size={'sm'} onClick={() => setShowReadOnly(true)}>
        <ForkAwesomeIcon icon={'lock'} className={'mx-1'}/>
        <Trans i18nKey={'editor.documentBar.permissions'}/>
      </Button>
      <CommonModal
        show={showReadOnly}
        onHide={() => setShowReadOnly(false)}
        closeButton={true}
        titleI18nKey={'editor.modal.permissions.title'}>
        <Modal.Body>
          <img className={'w-100'} src={'https://thumbs.gfycat.com/ImpassionedDeliriousIndianpalmsquirrel-size_restricted.gif'} alt={'Placeholder'}/>
        </Modal.Body>
      </CommonModal>
    </Fragment>
  )
}
