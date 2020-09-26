import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
//import { UsersService } from '../../src/users/users.service';
import { UserInfoDto } from '../../src/users/user-info.dto';
import { HistoryService } from '../../src/history/history.service';
import { NotesService } from '../../src/notes/notes.service';
import { HistoryEntryUpdateDto } from '../../src/history/history-entry-update.dto';
import { HistoryEntryDto } from '../../src/history/history-entry.dto';

// TODO Tests have to be reworked using UserService functions

describe('Notes', () => {
  let app: INestApplication;
  //let usersService: UsersService;
  let historyService: HistoryService;
  let notesService: NotesService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    // TODO Create User and generateAPI Token or other Auth
    app = moduleRef.createNestApplication();
    //usersService = moduleRef.get(UsersService);
    await app.init();
  });

  it.skip(`GET /me`, async () => {
    // TODO Get user from beforeAll
    const userInfo = new UserInfoDto();
    const response = await request(app.getHttpServer())
      .post('/me')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body.content).toEqual(userInfo);
  });

  it.skip(`GET /me/history`, async () => {
    // TODO user has to be chosen
    /* TODO Note maybe not added to history by createNote,
        use function from HistoryService instead
     */
    await notesService.createNote('', 'testGetHistory');
    const response = await request(app.getHttpServer())
      .get('/me/history')
      .expect('Content-Type', /json/)
      .expect(200);
    let historyEntry: HistoryEntryDto;
    for (const e of <any[]>response.body.content) {
      if ((<HistoryEntryDto>e).metadata.alias === 'testGetHistory') {
        historyEntry = e;
      }
    }
    expect(historyEntry).toEqual(history);
  });

  it.skip(`GET /me/history/{note}`, async () => {
    const noteName = 'testGetNoteHistory';
    /* TODO Note maybe not added to history by createNote,
        use function from HistoryService instead
     */
    await notesService.createNote('', noteName);
    const response = await request(app.getHttpServer())
      .get('/me/history/' + noteName)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body.metadata?.id).toBeDefined();
    return expect(response.body.metadata.alias).toEqual(noteName);
  });

  it.skip(`DELETE /me/history/{note}`, async () => {
    const noteName = 'testDeleteNoteHistory';
    /* TODO Note maybe not added to history by createNote,
        use function from HistoryService instead
     */
    await notesService.createNote('This is a test note.', noteName);
    const response = await request(app.getHttpServer())
      .delete('/me/history/test3')
      .expect(204);
    expect(response.body.content).toBeNull();
    const history = historyService.getUserHistory('testuser');
    let historyEntry: HistoryEntryDto = null;
    for (const e of history) {
      if (e.metadata.alias === noteName) {
        historyEntry = e;
      }
    }
    return expect(historyEntry).toBeNull();
  });

  it.skip(`PUT /me/history/{note}`, async () => {
    const noteName = 'testPutNoteHistory';
    // TODO use function from HistoryService to add an History Entry
    await notesService.createNote('', noteName);
    const historyEntryUpdateDto = new HistoryEntryUpdateDto();
    historyEntryUpdateDto.pinStatus = true;
    const response = await request(app.getHttpServer())
      .put('/me/history/' + noteName)
      .send(historyEntryUpdateDto)
      .expect(200);
    // TODO parameter is not used for now
    const history = historyService.getUserHistory('testuser');
    let historyEntry: HistoryEntryDto;
    for (const e of <any[]>response.body.content) {
      if ((<HistoryEntryDto>e).metadata.alias === noteName) {
        historyEntry = e;
      }
    }
    expect(historyEntry.pinStatus).toEqual(true);
    historyEntry = null;
    for (const e of history) {
      if (e.metadata.alias === noteName) {
        historyEntry = e;
      }
    }
    expect(historyEntry.pinStatus).toEqual(true);
  });


  it.skip(`GET /me/notes/`, async () => {
    // TODO use function from HistoryService to add an History Entry
    await notesService.createNote('This is a test note.', 'test7');
    // usersService.getALLNotesOwnedByUser() TODO Implement function
    const response = await request(app.getHttpServer())
      .get('/me/notes/')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body.revisions).toHaveLength(1);
  });

  afterAll(async () => {
    await app.close();
  });
});
