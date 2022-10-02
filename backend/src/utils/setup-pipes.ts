/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { ConsoleLoggerService } from '../logger/console-logger.service';

export function setupValidationPipe(
  logger: ConsoleLoggerService,
): ValidationPipe {
  return new ValidationPipe({
    forbidUnknownValues: true,
    skipMissingProperties: false,
    transform: true,
    exceptionFactory: (errors): BadRequestException => {
      // strip the trailing newline for cleaner logs
      const errorMessage = errors.toString().trimEnd();
      logger.debug(
        `Errors were encountered while validating a request:\n${errorMessage}`,
        'ValidationPipe',
      );
      return new BadRequestException(
        `Errors were encountered while validating a request:\n${errorMessage}`,
      );
    },
  });
}
