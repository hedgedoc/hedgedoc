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
