import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import * as getRawBody from 'raw-body';

/**
 * Extract the raw markdown from the request body and create a new note with it
 *
 * Implementation inspired by https://stackoverflow.com/questions/52283713/how-do-i-pass-plain-text-as-my-request-body-using-nestjs
 */
export const MarkdownBody = createParamDecorator(async (_, context: ExecutionContext) => {
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
    throw new BadRequestException('Body Content-Type has to be text/markdown!');
  }

});
