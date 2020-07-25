import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HistoryModule } from '../../../history/history.module';
import { User } from '../../../users/user.entity';
import { UsersModule } from '../../../users/users.module';
import { MeController } from './me.controller';

describe('Me Controller', () => {
  let controller: MeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeController],
      imports: [UsersModule, HistoryModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .compile();

    controller = module.get<MeController>(MeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
