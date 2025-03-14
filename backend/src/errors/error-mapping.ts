/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ForbiddenException,
  HttpServer,
  InternalServerErrorException,
  NotFoundException,
  PayloadTooLargeException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { BaseExceptionFilter } from '@nestjs/core';

import { ConsoleLoggerService } from '../logger/console-logger.service';
import { ErrorWithContextDetails } from './errors';
import {
  buildHttpExceptionObject,
  HttpExceptionObject,
} from './http-exception-object';

type HttpExceptionConstructor = (object: HttpExceptionObject) => HttpException;

const mapOfHedgeDocErrorsToHttpErrors: Map<string, HttpExceptionConstructor> =
  new Map([
    ['NotInDBError', (object): HttpException => new NotFoundException(object)],
    [
      'AlreadyInDBError',
      (object): HttpException => new ConflictException(object),
    ],
    [
      'ForbiddenIdError',
      (object): HttpException => new BadRequestException(object),
    ],
    ['ClientError', (object): HttpException => new BadRequestException(object)],
    [
      'PermissionError',
      (object): HttpException => new ForbiddenException(object),
    ],
    [
      'TokenNotValidError',
      (object): HttpException => new UnauthorizedException(object),
    ],
    [
      'TooManyTokensError',
      (object): HttpException => new BadRequestException(object),
    ],
    [
      'PermissionsUpdateInconsistentError',
      (object): HttpException => new BadRequestException(object),
    ],
    [
      'MediaBackendError',
      (object): HttpException => new InternalServerErrorException(object),
    ],
    [
      'PrimaryAliasDeletionForbiddenError',
      (object): HttpException => new BadRequestException(object),
    ],
    [
      'InvalidCredentialsError',
      (object): HttpException => new UnauthorizedException(object),
    ],
    [
      'NoLocalIdentityError',
      (object): HttpException => new BadRequestException(object),
    ],
    [
      'PasswordTooWeakError',
      (object): HttpException => new BadRequestException(object),
    ],
    [
      'MaximumDocumentLengthExceededError',
      (object): HttpException => new PayloadTooLargeException(object),
    ],
    [
      'FeatureDisabledError',
      (object): HttpException => new ForbiddenException(object),
    ],
  ]);

@Catch()
export class ErrorExceptionMapping extends BaseExceptionFilter<Error> {
  private readonly loggerService: ConsoleLoggerService;
  constructor(logger: ConsoleLoggerService, applicationRef?: HttpServer) {
    super(applicationRef);
    this.loggerService = logger;
  }

  catch(error: Error, host: ArgumentsHost): void {
    super.catch(this.transformError(error), host);
  }

  private transformError(error: Error): Error {
    const httpExceptionConstructor = mapOfHedgeDocErrorsToHttpErrors.get(
      error.name,
    );
    if (error instanceof ErrorWithContextDetails) {
      this.loggerService.error(
        error.message,
        undefined,
        error.functionContext,
        error.classContext,
      );
    }
    if (httpExceptionConstructor === undefined) {
      // We don't know how to map this error and just leave it be
      return error;
    }
    const httpExceptionObject = buildHttpExceptionObject(
      error.name,
      error.message,
    );
    return httpExceptionConstructor(httpExceptionObject);
  }
}
