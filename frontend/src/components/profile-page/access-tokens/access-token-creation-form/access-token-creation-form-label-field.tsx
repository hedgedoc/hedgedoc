/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../utils/cypress-attribute'
import type { ChangeEvent } from 'react'
import React, { useMemo } from 'react'
import { Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

interface AccessTokenCreationFormLabelFieldProps extends AccessTokenCreationFormFieldProps {
  onChangeLabel: (event: ChangeEvent<HTMLInputElement>) => void
}

/**
 * Input field for the label of a new token.
 *
 * @param onChangeLabel Callback for updating the stored label form value.
 * @param formValues The stored form values.
 */
export const AccessTokenCreationFormLabelField: React.FC<AccessTokenCreationFormLabelFieldProps> = ({
  onChangeLabel,
  formValues
}) => {
  const { t } = useTranslation()

  const labelValid = useMemo(() => {
    return formValues.label.trim() !== ''
  }, [formValues])

  return (
    <Form.Group>
      <Form.Label>
        <Trans i18nKey={'profile.accessTokens.label'} />
      </Form.Label>
      <Form.Control
        type='text'
        size='sm'
        placeholder={t('profile.accessTokens.label') ?? undefined}
        value={formValues.label}
        onChange={onChangeLabel}
        isValid={labelValid}
        required
        {...cypressId('access-token-add-input-label')}
      />
    </Form.Group>
  )
}
