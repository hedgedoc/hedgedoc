/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ServerStatusDto, ServerStatusSchema } from '@hedgedoc/commons';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { ApiTokenGuard } from '../../../api-token/api-token.guard';
import { MonitoringService } from '../../../monitoring/monitoring.service';
import { OpenApi } from '../../utils/openapi.decorator';

@UseGuards(ApiTokenGuard)
@OpenApi(401)
@ApiTags('monitoring')
@ApiSecurity('token')
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
}
