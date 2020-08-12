import { Column, ManyToOne } from 'typeorm/index';
import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';

export class NoteUserPermission {
  @ManyToOne(_ => User)
  user: User;

  @ManyToOne(_ => Note)
  note: Note;

  @Column()
  canEdit: boolean;
}
