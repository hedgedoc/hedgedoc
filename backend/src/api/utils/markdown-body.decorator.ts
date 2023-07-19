/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import getRawBody from 'raw-body';

/**
 * Extract the raw markdown from the request body and create a new note with it
 *
 * Implementation inspired by https://stackoverflow.com/questions/52283713/how-do-i-pass-plain-text-as-my-request-body-using-nestjs
 */
// Override naming convention as decorators are in PascalCase
// eslint-disable-next-line @typescript-eslint/naming-convention
export const MarkdownBody = createParamDecorator(
  async (_, context: ExecutionContext) => {
    // we have to check req.readable because of raw-body issue #57
    // https://github.com/stream-utils/raw-body/issues/57
    const req = context.switchToHttp().getRequest<import('express').Request>();
    // Here the Content-Type of the http request is checked to be text/markdown
    // because we dealing with markdown. Technically by now there can be any content which can be encoded.
    // There could be features in the software which do not work properly if the text can't be parsed as markdown.
    if (req.get('Content-Type') === 'text/markdown') {
      if (req.readable) {
        return (await getRawBody(req)).toString().trim();
      } else {
        throw new InternalServerErrorException('Failed to parse request body!');
      }
    } else {
      throw new BadRequestException(
        'Body Content-Type has to be text/markdown!',
      );
    }
  },
  [
    (target, key): void => {
      if (key === undefined) {
        throw new Error(
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          `Could not enhance param decorator for target ${target.toString()} because key is undefined`,
        );
      }
      const ownPropertyDescriptor = Object.getOwnPropertyDescriptor(
        target,
        key,
      );
      if (!ownPropertyDescriptor) {
        throw new Error(
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          `Could not get property descriptor for target ${target.toString()} and key ${key.toString()}`,
        );
      }
      ApiConsumes('text/markdown')(target, key, ownPropertyDescriptor);
      ApiBody({
        required: true,
        schema: { example: '# Markdown Body' },
      })(target, key, ownPropertyDescriptor);
    },
  ],
);
