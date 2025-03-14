/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class ErrorWithContextDetails extends Error {
  constructor(
    message?: string,
    public readonly classContext?: string,
    public readonly functionContext?: string,
  ) {
    super(message);
  }
}

export class NotInDBError extends ErrorWithContextDetails {
  name = 'NotInDBError';
}

export class AlreadyInDBError extends ErrorWithContextDetails {
  name = 'AlreadyInDBError';
}

export class GenericDBError extends ErrorWithContextDetails {
  name = 'GenericDBError';
}

export class ForbiddenIdError extends ErrorWithContextDetails {
  name = 'ForbiddenIdError';
}

export class ClientError extends ErrorWithContextDetails {
  name = 'ClientError';
}

export class PermissionError extends ErrorWithContextDetails {
  name = 'PermissionError';
}

export class TokenNotValidError extends ErrorWithContextDetails {
  name = 'TokenNotValidError';
}

export class TooManyTokensError extends ErrorWithContextDetails {
  name = 'TooManyTokensError';
}

export class PermissionsUpdateInconsistentError extends ErrorWithContextDetails {
  name = 'PermissionsUpdateInconsistentError';
}

export class MediaBackendError extends ErrorWithContextDetails {
  name = 'MediaBackendError';
}

export class PrimaryAliasDeletionForbiddenError extends ErrorWithContextDetails {
  name = 'PrimaryAliasDeletionForbiddenError';
}

export class InvalidCredentialsError extends ErrorWithContextDetails {
  name = 'InvalidCredentialsError';
}

export class NoLocalIdentityError extends ErrorWithContextDetails {
  name = 'NoLocalIdentityError';
}

export class PasswordTooWeakError extends ErrorWithContextDetails {
  name = 'PasswordTooWeakError';
}

export class MaximumDocumentLengthExceededError extends ErrorWithContextDetails {
  name = 'MaximumDocumentLengthExceededError';
}

export class FeatureDisabledError extends ErrorWithContextDetails {
  name = 'FeatureDisabledError';
}
