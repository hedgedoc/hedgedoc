import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from './note.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  name: string;

  @ManyToMany(
    _ => Note,
    note => note.tags,
  )
  notes: Note[];
}
