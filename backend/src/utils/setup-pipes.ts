/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BadRequestException, PipeTransform } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

import { ConsoleLoggerService } from '../logger/console-logger.service';

export function setupValidationPipe(logger: ConsoleLoggerService): PipeTransform {
  const ZodValidationPipe = createZodValidationPipe({
    createValidationException: (error: ZodError): BadRequestException => {
      const errorMessage = error.toString().trimEnd();
      logger.debug(
        `Errors were encountered while validating a request:\n${errorMessage}`,
        'ValidationPipe',
      );
      return new BadRequestException(
        `Errors were encountered while validating a request:\n${errorMessage}`,
      );
    },
  });

  return new ZodValidationPipe();
}
