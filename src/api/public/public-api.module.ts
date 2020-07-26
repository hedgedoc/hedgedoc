import { Module } from '@nestjs/common';
import { HistoryModule } from '../../history/history.module';
import { MonitoringModule } from '../../monitoring/monitoring.module';
import { NotesModule } from '../../notes/notes.module';
import { RevisionsModule } from '../../revisions/revisions.module';
import { UsersModule } from '../../users/users.module';
import { MeController } from './me/me.controller';
import { NotesController } from './notes/notes.controller';
import { MediaController } from './media/media.controller';
import { MonitoringController } from './monitoring/monitoring.controller';

@Module({
  imports: [
    UsersModule,
    HistoryModule,
    NotesModule,
    RevisionsModule,
    MonitoringModule,
  ],
  controllers: [
    MeController,
    NotesController,
    MediaController,
    MonitoringController,
  ],
})
export class PublicApiModule {}
