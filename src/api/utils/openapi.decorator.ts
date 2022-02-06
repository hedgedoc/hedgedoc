/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { applyDecorators, Header, HttpCode } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiProduces,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { BaseDto } from '../../utils/base.dto.';
import {
  badRequestDescription,
  conflictDescription,
  createdDescription,
  internalServerErrorDescription,
  noContentDescription,
  notFoundDescription,
  okDescription,
  unauthorizedDescription,
} from './descriptions';

export type HttpStatusCodes =
  | 200
  | 201
  | 204
  | 400
  | 401
  | 403
  | 404
  | 409
  | 500;

export interface HttpStatusCodeWithExtraInformation {
  code: HttpStatusCodes;
  description?: string;
  isArray?: boolean;
  dto?: BaseDto;
  mimeType?: string;
}

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
    let dto: BaseDto | undefined = undefined;
    if (typeof entry == 'number') {
      code = entry;
    } else {
      // We've got a HttpStatusCodeWithExtraInformation
      code = entry.code;
      description = entry.description;
      isArray = entry.isArray;
      dto = entry.dto;
      if (entry.mimeType) {
        decoratorsToApply.push(
          ApiProduces(entry.mimeType),
          Header('Content-Type', entry.mimeType),
        );
      }
    }
    switch (code) {
      case 200:
        decoratorsToApply.push(
          ApiOkResponse({
            description: description ?? okDescription,
            isArray: isArray,
            type: () => dto,
          }),
        );
        break;
      case 201:
        decoratorsToApply.push(
          ApiCreatedResponse({
            description: description ?? createdDescription,
            isArray: isArray,
            type: () => dto,
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
