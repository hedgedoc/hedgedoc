import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';

describe('Media Controller', () => {
  let controller: MediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
    }).compile();

    controller = module.get<MediaController>(MediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
