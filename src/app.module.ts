import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicApiModule } from './api/public/public-api.module';
import { NotesModule } from './notes/notes.module';
import { UsersModule } from './users/users.module';
import { RevisionsModule } from './revisions/revisions.module';
import { AuthorsModule } from './authors/authors.module';
import { HistoryModule } from './history/history.module';
import { MonitoringModule } from './monitoring/monitoring.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
