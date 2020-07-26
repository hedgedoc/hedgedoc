import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringService } from '../../../monitoring/monitoring.service';
import { MonitoringController } from './monitoring.controller';

describe('Monitoring Controller', () => {
  let controller: MonitoringController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [MonitoringService],
    }).compile();

    controller = module.get<MonitoringController>(MonitoringController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
