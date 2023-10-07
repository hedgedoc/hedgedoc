/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { TokenAuthGuard } from '../../../auth/token.strategy';
import { MonitoringService } from '../../../monitoring/monitoring.service';
import { ServerStatusDto } from '../../../monitoring/server-status.dto';
import { OpenApi } from '../../utils/openapi.decorator';

@UseGuards(TokenAuthGuard)
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
      dto: ServerStatusDto,
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
