import { Column, Entity, ManyToOne } from 'typeorm/index';
import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';

@Entity()
export class NoteUserPermission {
  @ManyToOne(_ => User, { primary: true })
  user: User;

  @ManyToOne(
    _ => Note,
    note => note.userPermissions,
    { primary: true },
  )
  note: Note;

  @Column()
  canEdit: boolean;
}
