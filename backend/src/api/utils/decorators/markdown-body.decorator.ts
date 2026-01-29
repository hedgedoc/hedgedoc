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

/**
 * Extract the raw markdown from the request body and create a new note with it
 *
 * Implementation inspired by https://stackoverflow.com/questions/52283713/how-do-i-pass-plain-text-as-my-request-body-using-nestjs
 */
// Override naming convention as decorators are in PascalCase
// oxlint-disable-next-line @typescript-eslint/naming-convention
export const MarkdownBody = createParamDecorator(
  async (_, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<import('fastify').FastifyRequest>();
    // Here the Content-Type of the http request is checked to be text/markdown
    // because we're dealing with markdown. Technically by now there can be any content which can be encoded.
    // There could be features in the software which do not work properly if the text can't be parsed as markdown.
    if (req.headers['content-type'] === 'text/markdown') {
      try {
        const body = await req.body;
        if (typeof body === 'string') {
          return body.trim();
        } else if (Buffer.isBuffer(body)) {
          return body.toString().trim();
        } else {
          throw new InternalServerErrorException('Unknown type of request body!');
        }
      } catch {
        throw new InternalServerErrorException('Failed to parse request body!');
      }
    } else {
      throw new BadRequestException('Body Content-Type has to be text/markdown!');
    }
  },
  [
    (target, key): void => {
      if (key === undefined) {
        throw new Error(
          // oxlint-disable-next-line @typescript-eslint/no-base-to-string
          `Could not enhance param decorator for target ${target.toString()} because key is undefined`,
        );
      }
      const ownPropertyDescriptor = Object.getOwnPropertyDescriptor(target, key);
      if (!ownPropertyDescriptor) {
        throw new Error(
          // oxlint-disable-next-line @typescript-eslint/no-base-to-string
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
