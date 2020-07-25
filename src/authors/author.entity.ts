import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from '../notes/note.entity';

@Entity()
export class Author {
  //TODO: Still missing many properties
  @PrimaryGeneratedColumn()
  id: number;

  note: Note;
}
