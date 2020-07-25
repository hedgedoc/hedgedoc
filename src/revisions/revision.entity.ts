import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from '../notes/note.entity';

@Entity()
export class Revision {
  //TODO: Still missing many properties
  @PrimaryGeneratedColumn('uuid')
  id: string;

  note: Note;
}
