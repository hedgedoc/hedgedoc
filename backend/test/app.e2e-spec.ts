/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getConfigToken } from '@nestjs/config';
import { WsAdapter } from '@nestjs/platform-ws';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { BackendType } from '../src/media/backends/backend-type.enum';

describe('App', () => {
  it('should not crash on requests to /', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getConfigToken('appConfig'))
      .useValue({
        baseUrl: 'localhost',
        port: 3333,
      })
      .overrideProvider(getConfigToken('mediaConfig'))
      .useValue({
        backend: {
          use: BackendType.FILESYSTEM,
          filesystem: {
            uploadPath:
              'test_uploads' + Math.floor(Math.random() * 100000).toString(),
          },
        },
      })
      .overrideProvider(getConfigToken('databaseConfig'))
      .useValue({
        database: ':memory:',
        type: 'sqlite',
      })
      .overrideProvider(getConfigToken('authConfig'))
      .useValue({
        session: {
          secret: 'secret',
        },
        oidc: [],
      })
      .compile();

    /**
     * TODO: This is not really a regression test, as it does not use the
     *  real initialization code in main.ts.
     *  Should be fixed after https://github.com/hedgedoc/hedgedoc/issues/2083
     *  is done.
     */
    const app = moduleRef.createNestApplication();
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.init();
    await request(app.getHttpServer()).get('/').expect(404);
    await app.close();
  });
});
