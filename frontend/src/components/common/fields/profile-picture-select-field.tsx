/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react'
import type { CommonFieldProps } from './fields'
import { Form } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import { useAvatarUrl } from '../user-avatar/hooks/use-avatar-url'
import { useFrontendConfig } from '../frontend-config-context/use-frontend-config'

export enum ProfilePictureChoice {
  PROVIDER,
  FALLBACK
}

export interface ProfilePictureSelectFieldProps extends CommonFieldProps<ProfilePictureChoice> {
  onChange: (choice: ProfilePictureChoice) => void
  value: ProfilePictureChoice
  photoUrl: string | null
  username: string
}

/**
 * A field to select the profile picture.
 * @param onChange The callback to call when the value changes.
 * @param pictureUrl The URL of the picture provided by the identity provider.
 * @param username The username of the user.
 * @param value The current value of the field.
 */
export const ProfilePictureSelectField: React.FC<ProfilePictureSelectFieldProps> = ({
  onChange,
  photoUrl,
  username,
  value
}) => {
  const fallbackUrl = useAvatarUrl({
    username,
    photoUrl,
    displayName: username
  })
  const profileEditsAllowed = useFrontendConfig().allowProfileEdits
  const onSetProviderPicture = useCallback(() => {
    if (value !== ProfilePictureChoice.PROVIDER) {
      onChange(ProfilePictureChoice.PROVIDER)
    }
  }, [onChange, value])
  const onSetFallbackPicture = useCallback(() => {
    if (value !== ProfilePictureChoice.FALLBACK) {
      onChange(ProfilePictureChoice.FALLBACK)
    }
  }, [onChange, value])

  if (!profileEditsAllowed) {
    return null
  }

  return (
    <Form.Group>
      <Form.Label>
        <Trans i18nKey='profile.selectProfilePicture.title' />
      </Form.Label>
      {photoUrl && (
        <Form.Check className={'d-flex gap-2 align-items-center mb-3'} type='radio'>
          <Form.Check.Input
            type={'radio'}
            checked={value === ProfilePictureChoice.PROVIDER}
            onChange={onSetProviderPicture}
          />
          <Form.Check.Label>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt={'Profile picture provided by the identity provider'} height={48} width={48} />
          </Form.Check.Label>
        </Form.Check>
      )}
      <Form.Check className={'d-flex gap-2 align-items-center'} type='radio'>
        <Form.Check.Input
          type='radio'
          checked={value === ProfilePictureChoice.FALLBACK}
          onChange={onSetFallbackPicture}
        />
        <Form.Check.Label>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={'Fallback profile picture'} src={fallbackUrl} height={48} width={48} />
        </Form.Check.Label>
      </Form.Check>
      <Form.Text>
        <Trans i18nKey='profile.selectProfilePicture.info' />
      </Form.Text>
    </Form.Group>
  )
}
