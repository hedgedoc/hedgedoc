import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from '../../../logger/logger.module';
import { MediaController } from './media.controller';

describe('Media Controller', () => {
  let controller: MediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      imports: [LoggerModule],
    }).compile();

    controller = module.get<MediaController>(MediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
