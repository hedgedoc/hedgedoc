/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOnInputChange } from '../../../../hooks/common/use-on-input-change'
import { Button, FormControl, InputGroup } from 'react-bootstrap'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'

export interface PermissionOwnerChangeProps {
  onConfirmOwnerChange: (newOwner: string) => void
}

/**
 * Renders an input group to change the permission owner.
 *
 * @param onConfirmOwnerChange The callback to call if the owner was changed.
 */
export const PermissionOwnerChange: React.FC<PermissionOwnerChangeProps> = ({ onConfirmOwnerChange }) => {
  const { t } = useTranslation()
  const [ownerFieldValue, setOwnerFieldValue] = useState('')

  const onChangeField = useOnInputChange(setOwnerFieldValue)
  const onClickConfirm = useCallback(() => {
    onConfirmOwnerChange(ownerFieldValue)
  }, [ownerFieldValue, onConfirmOwnerChange])

  const confirmButtonDisabled = useMemo(() => {
    return ownerFieldValue.trim() === ''
  }, [ownerFieldValue])

  return (
    <InputGroup className={'mr-1 mb-1'}>
      <FormControl
        value={ownerFieldValue}
        placeholder={t('editor.modal.permissions.ownerChange.placeholder')}
        onChange={onChangeField}
      />
      <Button
        variant='light'
        title={t('common.save')}
        onClick={onClickConfirm}
        className={'ml-2'}
        disabled={confirmButtonDisabled}>
        <ForkAwesomeIcon icon={'check'} />
      </Button>
    </InputGroup>
  )
}
