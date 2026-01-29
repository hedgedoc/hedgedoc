/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { MulterFile } from '../../../media/multer-file.interface';

/**
 * Extracts the file from a multipart request (for example POST of an image)
 * and returns it in the multer file interface format.
 * @param fieldName The name of the file field in the multipart request
 */
export const FastifyFile = createParamDecorator(
  async (fieldName: string, ctx: ExecutionContext): Promise<MulterFile | undefined> => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();

    if (!request.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    try {
      const data = await request.file();
      if (!data) {
        return undefined;
      }

      const buffer = await data.toBuffer();

      return {
        fieldname: data.fieldname,
        originalname: data.filename,
        encoding: data.encoding,
        mimetype: data.mimetype,
        size: buffer.length,
        buffer: buffer,
      } as MulterFile;
    } catch {
      throw new BadRequestException('Failed to parse multipart data');
    }
  },
);
