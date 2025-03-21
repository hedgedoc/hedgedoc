/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { applyDecorators, Header, HttpCode } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiProduces,
  ApiResponseNoStatusOptions,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { zodToOpenAPI } from 'nestjs-zod';
import { ZodSchema } from 'zod';

import {
  badRequestDescription,
  conflictDescription,
  createdDescription,
  foundDescription,
  internalServerErrorDescription,
  noContentDescription,
  notFoundDescription,
  okDescription,
  payloadTooLargeDescription,
  unauthorizedDescription,
} from './descriptions';

export type HttpStatusCodes =
  | 200
  | 201
  | 204
  | 302
  | 400
  | 401
  | 403
  | 404
  | 409
  | 413
  | 500;

/**
 * Defines what the open api route should document.
 *
 * This makes it possible to document
 * - description
 * - return object
 * - if the return object is an array
 * - the mimeType of the response
 */
export interface HttpStatusCodeWithExtraInformation {
  code: HttpStatusCodes;
  description?: string;
  isArray?: boolean;
  schema?: ZodSchema;
  mimeType?: string;
}

/**
 * This decorator is used to document what an api route returns.
 *
 * The decorator can be used on a controller method or on a whole controller class (if one wants to document that every method of the controller returns something).
 *
 * @param httpStatusCodesMaybeWithExtraInformation - list of parameters can either be just the {@link HttpStatusCodes} or a {@link HttpStatusCodeWithExtraInformation}.
 * If only a {@link HttpStatusCodes} is provided a default description will be used.
 *
 * For non-200 successful responses the appropriate {@link HttpCode} decorator is set
 * @constructor
 */
// eslint-disable-next-line @typescript-eslint/naming-convention,func-style
export const OpenApi = (
  ...httpStatusCodesMaybeWithExtraInformation: (
    | HttpStatusCodes
    | HttpStatusCodeWithExtraInformation
  )[]
): // eslint-disable-next-line @typescript-eslint/ban-types
(<TFunction extends Function, Y>(
  target: object | TFunction,
  propertyKey?: string | symbol,
  descriptor?: TypedPropertyDescriptor<Y>,
) => void) => {
  const decoratorsToApply: (MethodDecorator | ClassDecorator)[] = [];
  for (const entry of httpStatusCodesMaybeWithExtraInformation) {
    let code: HttpStatusCodes = 200;
    let description: string | undefined = undefined;
    let isArray: boolean | undefined = undefined;
    let schema: ZodSchema | undefined = undefined;

    if (typeof entry == 'number') {
      code = entry;
    } else {
      // We've got a HttpStatusCodeWithExtraInformation
      code = entry.code;
      description = entry.description;
      isArray = entry.isArray;
      schema = entry.schema;
      if (entry.mimeType) {
        decoratorsToApply.push(
          ApiProduces(entry.mimeType),
          Header('Content-Type', entry.mimeType),
        );
      }
    }

    let defaultResponseObject: ApiResponseNoStatusOptions = {
      description: description ?? createdDescription,
      isArray: isArray,
    };
    if (schema) {
      defaultResponseObject = {
        ...defaultResponseObject,
        schema: zodToOpenAPI(schema),
      };
    }

    switch (code) {
      case 200:
        decoratorsToApply.push(
          ApiOkResponse({
            ...defaultResponseObject,
            description: description ?? okDescription,
          }),
        );
        break;
      case 201:
        decoratorsToApply.push(
          ApiCreatedResponse({
            ...defaultResponseObject,
            description: description ?? createdDescription,
          }),
          HttpCode(201),
        );
        break;
      case 204:
        decoratorsToApply.push(
          ApiNoContentResponse({
            description: description ?? noContentDescription,
          }),
          HttpCode(204),
        );
        break;
      case 302:
        decoratorsToApply.push(
          ApiFoundResponse({
            description: description ?? foundDescription,
          }),
          HttpCode(302),
        );
        break;
      case 400:
        decoratorsToApply.push(
          ApiBadRequestResponse({
            description: description ?? badRequestDescription,
          }),
        );
        break;
      case 401:
        decoratorsToApply.push(
          ApiUnauthorizedResponse({
            description: description ?? unauthorizedDescription,
          }),
        );
        break;
      case 404:
        decoratorsToApply.push(
          ApiNotFoundResponse({
            description: description ?? notFoundDescription,
          }),
        );
        break;
      case 409:
        decoratorsToApply.push(
          ApiConflictResponse({
            description: description ?? conflictDescription,
          }),
        );
        break;
      case 413:
        decoratorsToApply.push(
          ApiConflictResponse({
            description: description ?? payloadTooLargeDescription,
          }),
        );
        break;
      case 500:
        decoratorsToApply.push(
          ApiInternalServerErrorResponse({
            description: internalServerErrorDescription,
          }),
        );
        break;
    }
  }

  return applyDecorators(...decoratorsToApply);
};
