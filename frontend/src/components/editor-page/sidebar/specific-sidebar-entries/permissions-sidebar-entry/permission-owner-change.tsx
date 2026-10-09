/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useOnInputChange } from '../../../../../hooks/common/use-on-input-change'
import { useTranslatedText } from '../../../../../hooks/common/use-translated-text'
import { UiIcon } from '../../../../common/icons/ui-icon'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, FormControl, InputGroup } from 'react-bootstrap'
import { Check as IconCheck } from 'react-bootstrap-icons'

export interface PermissionOwnerChangeProps {
  onConfirmOwnerChange: (newOwner: string) => void
  onCancelOwnerChange: () => void
}

/**
 * Renders an input group to change the permission owner.
 *
 * @param onConfirmOwnerChange The callback to call if the owner was changed.
 * @param onCancelOwnerChange The callback to call if the owner change should be canceled
 */
export const PermissionOwnerChange: React.FC<PermissionOwnerChangeProps> = ({
  onConfirmOwnerChange,
  onCancelOwnerChange
}) => {
  const [ownerFieldValue, setOwnerFieldValue] = useState('')

  const onChangeField = useOnInputChange(setOwnerFieldValue)
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancelOwnerChange()
      }
    },
    [onCancelOwnerChange]
  )
  const onClickConfirm = useCallback(() => {
    onConfirmOwnerChange(ownerFieldValue)
  }, [ownerFieldValue, onConfirmOwnerChange])

  const confirmButtonDisabled = useMemo(() => {
    return ownerFieldValue.trim() === ''
  }, [ownerFieldValue])

  const placeholderText = useTranslatedText('editor.permissions.ownerChange.placeholder')
  const buttonTitleText = useTranslatedText('common.save')

  return (
    <InputGroup className={'mb-1'}>
      <FormControl
        value={ownerFieldValue}
        placeholder={placeholderText}
        onChange={onChangeField}
        onKeyDown={onKeyDown}
      />
      <Button
        variant='primary'
        title={buttonTitleText}
        onClick={onClickConfirm}
        className={'text-ms-2'}
        disabled={confirmButtonDisabled}>
        <UiIcon icon={IconCheck} />
      </Button>
    </InputGroup>
  )
}
