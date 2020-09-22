import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { PublicApiModule } from '../../src/api/public/public-api.module';
import { GroupsModule } from '../../src/groups/groups.module';
import { NotesModule } from '../../src/notes/notes.module';
import { NotesService } from '../../src/notes/notes.service';
import { PermissionsModule } from '../../src/permissions/permissions.module';

describe('Notes', () => {
  let app: INestApplication;
  let notesService: NotesService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        PublicApiModule,
        NotesModule,
        PermissionsModule,
        GroupsModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: './hedgedoc-e2e.sqlite',
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    notesService = moduleRef.get(NotesService);
    const noteRepository = moduleRef.get('NoteRepository');
    noteRepository.clear();
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
    await notesService.createNote('This is a test note.', 'test1');
    const response = await request(app.getHttpServer())
      .get('/notes/test1')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body.content).toEqual('This is a test note.');
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
    await request(app.getHttpServer())
      .delete('/notes/test3')
      .expect(200);
    return expect(notesService.getNoteByIdOrAlias('test3')).rejects.toEqual(
      Error('Note not found'),
    );
  });

  it(`PUT /notes/{note}`, async () => {
    await notesService.createNote('This is a test note.', 'test4');
    await request(app.getHttpServer())
      .put('/notes/test4')
      .set('Content-Type', 'text/markdown')
      .send('New note text')
      .expect(200);
    return expect(
      (await notesService.getNoteDtoByIdOrAlias('test4')).content,
    ).toEqual('New note text');
  });

  it.skip(`PUT /notes/{note}/metadata`, () => {
    // TODO
    return request(app.getHttpServer())
      .post('/notes/test5/metadata')
      .set('Content-Type', 'text/markdown')
      .expect(200);
  });

  it.skip(`GET /notes/{note}/metadata`, () => {
    notesService.createNote('This is a test note.', 'test6');
    return request(app.getHttpServer())
      .get('/notes/test6/metadata')
      .expect(200);
    // TODO: Find out how to check the structure of the returned JSON
  });

  it(`GET /notes/{note}/revisions`, async () => {
    await notesService.createNote('This is a test note.', 'test7');
    const response = await request(app.getHttpServer())
      .get('/notes/test7/revisions')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toHaveLength(1);
  });

  it(`GET /notes/{note}/revisions/{revision-id}`, async () => {
    const note = await notesService.createNote('This is a test note.', 'test8');
    const revision = await notesService.getLastRevision(note);
    const response = await request(app.getHttpServer())
      .get('/notes/test8/revisions/' + revision.id)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body.content).toEqual('This is a test note.');
  });

  it(`GET /notes/{note}/content`, async () => {
    await notesService.createNote('This is a test note.', 'test9');
    const response = await request(app.getHttpServer())
      .get('/notes/test9/content')
      .expect(200);
    expect(response.body).toEqual('This is a test note.');
  });

  afterAll(async () => {
    await app.close();
  });
});
