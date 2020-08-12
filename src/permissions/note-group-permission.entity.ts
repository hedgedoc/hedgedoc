import { Column, ManyToOne } from 'typeorm/index';
import { Group } from '../groups/group.entity';
import { Note } from '../notes/note.entity';

export class NoteGroupPermission {
  @ManyToOne(_ => Group)
  group: Group;

  @ManyToOne(_ => Note)
  note: Note;

  @Column()
  canEdit: boolean;
}
