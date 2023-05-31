/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CommonFieldProps } from './fields'
import React, { useMemo } from 'react'
import { Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

interface DisplayNameFieldProps extends CommonFieldProps {
  initialValue?: string
}

/**
 * Renders an input field for the display name when registering.
 *
 * @param onChange Hook that is called when the entered display name changes.
 * @param value The currently entered display name.
 * @param initialValue The initial input field value.
 */
export const DisplayNameField: React.FC<DisplayNameFieldProps> = ({ onChange, value, initialValue }) => {
  const { t } = useTranslation()

  const isValid = useMemo(() => {
    return value.trim() !== '' && value !== initialValue
  }, [value, initialValue])

  return (
    <Form.Group>
      <Form.Label>
        <Trans i18nKey='profile.displayName' />
      </Form.Label>
      <Form.Control
        type='text'
        size='sm'
        value={value}
        isValid={isValid}
        onChange={onChange}
        placeholder={t('profile.displayName') ?? undefined}
        autoComplete='name'
        required
      />
      <Form.Text>
        <Trans i18nKey='profile.displayNameInfo' />
      </Form.Text>
    </Form.Group>
  )
}
