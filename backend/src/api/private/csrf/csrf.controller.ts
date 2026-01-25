/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';

import { OpenApi } from '../../utils/decorators/openapi.decorator';
import { CsrfTokenDto } from '../../../dtos/csrf-token.dto';

@ApiTags('csrf')
@Controller('csrf')
export class CsrfController {
  constructor() {}

  @Get('token')
  @OpenApi(200)
  getToken(@Res({ passthrough: true }) res: FastifyReply): CsrfTokenDto {
    const token = res.generateCsrf();
    return CsrfTokenDto.create({
      token,
    });
  }
}
