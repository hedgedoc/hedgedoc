import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { PublicApiModule } from '../../src/api/public/public-api.module';
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
      new NotInDBError("Note with id/alias 'test3' not found."),
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

  it(`PUT /notes/{note}/metadata`, async () => {
    await notesService.createNote('This is a test note.', 'test5');
    await request(app.getHttpServer())
      .put('/notes/test5/metadata')
      .send({
        title: 'test title',
        description: 'test description',
        tags: ['test1', 'test2', 'test3'],
      })
      .expect(200);
    const note5 = await notesService.getNoteByIdOrAlias('test5');
    expect(note5.title).toEqual('test title');
    expect(note5.description).toEqual('test description');
    expect(note5.tags.map(tag => tag.name)).toEqual([
      'test1',
      'test2',
      'test3',
    ]);
  });

  it(`GET /notes/{note}/metadata`, async () => {
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
    expect(response.text).toEqual('This is a test note.');
  });

  it(`2 notes with tags`, async () => {
    //Create first nore
    const content10 = 'This is the first test note.';
    const note10 = await request(app.getHttpServer())
      .post('/notes/test10')
      .set('Content-Type', 'text/markdown')
      .send(content10)
      .expect('Content-Type', /json/)
      .expect(201);
    expect(note10.body.metadata?.id).toBeDefined();
    //Create second note
    const content11 = 'This is the second test note.';
    const note11 = await request(app.getHttpServer())
      .post('/notes/test11')
      .set('Content-Type', 'text/markdown')
      .send(content11)
      .expect('Content-Type', /json/)
      .expect(201);
    expect(note11.body.metadata?.id).toBeDefined();
    //Add tags to both notes
    await request(app.getHttpServer())
      .put('/notes/test10/metadata')
      .send({
        title: 'Test Note 10',
        description: 'test description',
        tags: ['test1', 'test2', 'test3'],
      })
      .expect(200);
    await request(app.getHttpServer())
      .put('/notes/test11/metadata')
      .send({
        title: 'Test Note 11',
        description: 'test description',
        tags: ['test1', 'test2', 'test4'],
      })
      .expect(200);
    //Delete first note
    await request(app.getHttpServer())
      .delete('/notes/test10')
      .expect(200);
    //Check if all tags are still present
    const metadata11 = await request(app.getHttpServer())
      .get('/notes/test11/metadata')
      .expect(200);
    expect(metadata11.body.tags).toEqual(['test1', 'test2', 'test4']);
  });

  afterAll(async () => {
    await app.close();
  });
});
