/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from '../../../monitoring/monitoring.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(private monitoringService: MonitoringService) {}

  @Get()
  getStatus() {
    return this.monitoringService.getServerStatus();
  }

  @Get('prometheus')
  getPrometheusStatus() {
    return '';
  }
}
