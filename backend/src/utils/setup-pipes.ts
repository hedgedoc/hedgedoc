/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PipeTransform } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import type { $ZodError } from 'zod/v4/core';

import type { ConsoleLoggerService } from '../logger/console-logger.service';

export function setupValidationPipe(logger: ConsoleLoggerService): PipeTransform {
  const ZodValidationPipe = createZodValidationPipe({
    createValidationException: (error): BadRequestException => {
      const errorMessage = (error as $ZodError).toString().trimEnd();
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
