/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ServerStatusSchema } from '@hedgedoc/commons';
import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { ServerStatusDto } from '../../../dtos/server-status.dto';
import { MonitoringService } from '../../../monitoring/monitoring.service';
import { OpenApi } from '../../utils/decorators/openapi.decorator';

@ApiTags('monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(private monitoringService: MonitoringService) {}

  @Get()
  @OpenApi(
    {
      code: 200,
      description: 'The server info',
      schema: ServerStatusSchema,
    },
    403,
  )
  getStatus(): Promise<ServerStatusDto> {
    return this.monitoringService.getServerStatus();
  }

  @Get('prometheus')
  @OpenApi(
    {
      code: 200,
      description: 'Prometheus compatible monitoring data',
      mimeType: 'text/plain',
    },
    403,
  )
  getPrometheusStatus(): string {
    return '';
  }

  @Get('health')
  @HttpCode(HttpStatus.NO_CONTENT)
  @OpenApi(
    {
      code: 204,
      description: 'HedgeDoc is healthy',
    },
    {
      code: 503,
      description: 'HedgeDoc is currently not healthy',
    },
  )
  async getHealth(@Res() reply: FastifyReply): Promise<void> {
    const isHealthy = await this.monitoringService.isHealthy();
    if (isHealthy) {
      reply.status(HttpStatus.NO_CONTENT).send();
    } else {
      reply.status(HttpStatus.SERVICE_UNAVAILABLE).send();
    }
  }
}
