/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Logger } from '@nestjs/common';

class ErrorWithLogger extends Error {
  constructor(message: string, logger: Logger) {
    logger.error(message);
  }
}

export class NotInDBError extends ErrorWithLogger {
  name = 'NotInDBError';
}

export class AlreadyInDBError extends ErrorWithLogger {
  name = 'AlreadyInDBError';
}

export class GenericDBError extends ErrorWithLogger {
  name = 'GenericDBError';
}

export class ForbiddenIdError extends ErrorWithLogger {
  name = 'ForbiddenIdError';
}

export class ClientError extends ErrorWithLogger {
  name = 'ClientError';
}

export class PermissionError extends ErrorWithLogger {
  name = 'PermissionError';
}

export class TokenNotValidError extends ErrorWithLogger {
  name = 'TokenNotValidError';
}

export class TooManyTokensError extends ErrorWithLogger {
  name = 'TooManyTokensError';
}

export class PermissionsUpdateInconsistentError extends ErrorWithLogger {
  name = 'PermissionsUpdateInconsistentError';
}

export class MediaBackendError extends ErrorWithLogger {
  name = 'MediaBackendError';
}

export class PrimaryAliasDeletionForbiddenError extends ErrorWithLogger {
  name = 'PrimaryAliasDeletionForbiddenError';
}

export class InvalidCredentialsError extends ErrorWithLogger {
  name = 'InvalidCredentialsError';
}

export class NoLocalIdentityError extends ErrorWithLogger {
  name = 'NoLocalIdentityError';
}

export class PasswordTooWeakError extends ErrorWithLogger {
  name = 'PasswordTooWeakError';
}

export class MaximumDocumentLengthExceededError extends ErrorWithLogger {
  name = 'MaximumDocumentLengthExceededError';
}

export class FeatureDisabledError extends ErrorWithLogger {
  name = 'FeatureDisabledError';
}
