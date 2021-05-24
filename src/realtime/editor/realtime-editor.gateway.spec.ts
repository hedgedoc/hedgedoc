import { Test, TestingModule } from '@nestjs/testing';

import { RealtimeEditorGateway } from './realtime-editor.gateway';

describe('RealtimeEditorGateway', () => {
  let gateway: RealtimeEditorGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealtimeEditorGateway],
    }).compile();

    gateway = module.get<RealtimeEditorGateway>(RealtimeEditorGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
