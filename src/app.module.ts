import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicApiModule } from './api/public/public-api.module';
import { AuthorsModule } from './authors/authors.module';
import { GroupsModule } from './groups/groups.module';
import { HistoryModule } from './history/history.module';
import { LoggerModule } from './logger/logger.module';
import { MediaModule } from './media/media.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { NotesModule } from './notes/notes.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RevisionsModule } from './revisions/revisions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './hedgedoc.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    NotesModule,
    UsersModule,
    RevisionsModule,
    AuthorsModule,
    PublicApiModule,
    HistoryModule,
    MonitoringModule,
    PermissionsModule,
    GroupsModule,
    LoggerModule,
    MediaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
