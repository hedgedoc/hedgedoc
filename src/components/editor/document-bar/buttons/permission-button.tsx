import React, { Fragment, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { CommonModal } from '../../../common/modals/common-modal'
import { TranslatedIconButton } from '../../../common/icon-button/translated-icon-button'

export const PermissionButton: React.FC = () => {
  const [showReadOnly, setShowReadOnly] = useState(false)

  return (
    <Fragment>
      <TranslatedIconButton size={'sm'} className={'mx-1'} icon={'lock'} variant={'light'} onClick={() => setShowReadOnly(true)} i18nKey={'editor.documentBar.permissions'}/>
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
