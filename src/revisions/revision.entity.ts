import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Note } from '../notes/note.entity';

@Entity()
export class Revision {
  //TODO: This is the old schema, we probably want to change it
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  patch: string;

  @Column({
    type: 'text',
  })
  lastContent: string;

  @Column({
    type: 'text',
  })
  content: string;

  @Column()
  length: number;

  @Column({ type: 'text' })
  authorship: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    _ => Note,
    note => note.revisions,
    { onDelete: 'CASCADE' },
  )
  note: Note;
}
