/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { PublicApiModule } from '../../src/api/public/public-api.module';
import appConfigMock from '../../src/config/app.config.mock';
import mediaConfigMock from '../../src/config/media.config.mock';
import { NotInDBError } from '../../src/errors/errors';
import { GroupsModule } from '../../src/groups/groups.module';
import { LoggerModule } from '../../src/logger/logger.module';
import { NotesModule } from '../../src/notes/notes.module';
import { NotesService } from '../../src/notes/notes.service';
import { PermissionsModule } from '../../src/permissions/permissions.module';

describe('Notes', () => {
  let app: INestApplication;
  let notesService: NotesService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, mediaConfigMock],
        }),
        PublicApiModule,
        NotesModule,
        PermissionsModule,
        GroupsModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: './hedgedoc-e2e-notes.sqlite',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        LoggerModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    notesService = moduleRef.get(NotesService);
  });

  it(`POST /notes`, async () => {
    const newNote = 'This is a test note.';
    const response = await request(app.getHttpServer())
      .post('/notes')
      .set('Content-Type', 'text/markdown')
      .send(newNote)
      .expect('Content-Type', /json/)
      .expect(201);
    expect(response.body.metadata?.id).toBeDefined();
    expect(
      (await notesService.getNoteDtoByIdOrAlias(response.body.metadata.id))
        .content,
    ).toEqual(newNote);
  });

  it(`GET /notes/{note}`, async () => {
    // check if we can succefully get a note that exists
    await notesService.createNote('This is a test note.', 'test1');
    const response = await request(app.getHttpServer())
      .get('/notes/test1')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body.content).toEqual('This is a test note.');

    // check if a missing note correctly returns 404
    await request(app.getHttpServer())
      .get('/notes/i_dont_exist')
      .expect('Content-Type', /json/)
      .expect(404);
  });

  it(`POST /notes/{note}`, async () => {
    const newNote = 'This is a test note.';
    const response = await request(app.getHttpServer())
      .post('/notes/test2')
      .set('Content-Type', 'text/markdown')
      .send(newNote)
      .expect('Content-Type', /json/)
      .expect(201);
    expect(response.body.metadata?.id).toBeDefined();
    return expect(
      (await notesService.getNoteDtoByIdOrAlias(response.body.metadata.id))
        .content,
    ).toEqual(newNote);
  });

  it(`DELETE /notes/{note}`, async () => {
    await notesService.createNote('This is a test note.', 'test3');
    await request(app.getHttpServer()).delete('/notes/test3').expect(200);
    await expect(notesService.getNoteByIdOrAlias('test3')).rejects.toEqual(
      new NotInDBError("Note with id/alias 'test3' not found."),
    );
    // check if a missing note correctly returns 404
    await request(app.getHttpServer())
      .delete('/notes/i_dont_exist')
      .expect(404);
  });

  it(`PUT /notes/{note}`, async () => {
    await notesService.createNote('This is a test note.', 'test4');
    await request(app.getHttpServer())
      .put('/notes/test4')
      .set('Content-Type', 'text/markdown')
      .send('New note text')
      .expect(200);
    await expect(
      (await notesService.getNoteDtoByIdOrAlias('test4')).content,
    ).toEqual('New note text');

    // check if a missing note correctly returns 404
    await request(app.getHttpServer())
      .put('/notes/i_dont_exist')
      .set('Content-Type', 'text/markdown')
      .expect('Content-Type', /json/)
      .expect(404);
  });

  describe('GET /notes/{note}/metadata', () => {
    it(`returns complete metadata object`, async () => {
      await notesService.createNote('This is a test note.', 'test6');
      const metadata = await request(app.getHttpServer())
        .get('/notes/test6/metadata')
        .expect(200);
      expect(typeof metadata.body.id).toEqual('string');
      expect(metadata.body.alias).toEqual('test6');
      expect(metadata.body.title).toBeNull();
      expect(metadata.body.description).toBeNull();
      expect(typeof metadata.body.createTime).toEqual('string');
      expect(metadata.body.editedBy).toEqual([]);
      expect(metadata.body.permissions.owner).toBeNull();
      expect(metadata.body.permissions.sharedToUsers).toEqual([]);
      expect(metadata.body.permissions.sharedToUsers).toEqual([]);
      expect(metadata.body.tags).toEqual([]);
      expect(typeof metadata.body.updateTime).toEqual('string');
      expect(typeof metadata.body.updateUser.displayName).toEqual('string');
      expect(typeof metadata.body.updateUser.userName).toEqual('string');
      expect(typeof metadata.body.updateUser.email).toEqual('string');
      expect(typeof metadata.body.updateUser.photo).toEqual('string');
      expect(typeof metadata.body.viewCount).toEqual('number');
      expect(metadata.body.editedBy).toEqual([]);

      // check if a missing note correctly returns 404
      await request(app.getHttpServer())
        .get('/notes/i_dont_exist/metadata')
        .expect('Content-Type', /json/)
        .expect(404);
    });

    it('has the correct update/create dates', async () => {
      // create a note
      const note = await notesService.createNote(
        'This is a test note.',
        'test6a',
      );
      // save the creation time
      const createDate = (await note.revisions)[0].createdAt;
      // wait one second
      await new Promise((r) => setTimeout(r, 1000));
      // update the note
      await notesService.updateNoteByIdOrAlias('test6a', 'More test content');
      const metadata = await request(app.getHttpServer())
        .get('/notes/test6a/metadata')
        .expect(200);
      expect(metadata.body.createTime).toEqual(createDate.toISOString());
      expect(metadata.body.updateTime).not.toEqual(createDate.toISOString());
    });
  });

  it(`GET /notes/{note}/revisions`, async () => {
    await notesService.createNote('This is a test note.', 'test7');
    const response = await request(app.getHttpServer())
      .get('/notes/test7/revisions')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toHaveLength(1);

    // check if a missing note correctly returns 404
    await request(app.getHttpServer())
      .get('/notes/i_dont_exist/revisions')
      .expect('Content-Type', /json/)
      .expect(404);
  });

  it(`GET /notes/{note}/revisions/{revision-id}`, async () => {
    const note = await notesService.createNote('This is a test note.', 'test8');
    const revision = await notesService.getLatestRevision(note);
    const response = await request(app.getHttpServer())
      .get('/notes/test8/revisions/' + revision.id)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body.content).toEqual('This is a test note.');

    // check if a missing note correctly returns 404
    await request(app.getHttpServer())
      .get('/notes/i_dont_exist/revisions/1')
      .expect('Content-Type', /json/)
      .expect(404);
  });

  it(`GET /notes/{note}/content`, async () => {
    await notesService.createNote('This is a test note.', 'test9');
    const response = await request(app.getHttpServer())
      .get('/notes/test9/content')
      .expect(200);
    expect(response.text).toEqual('This is a test note.');

    // check if a missing note correctly returns 404
    await request(app.getHttpServer())
      .get('/notes/i_dont_exist/content')
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
