import { AutoIncrement, Table, Column, DataType, PrimaryKey, Model, BelongsTo, createIndexDecorator, ForeignKey } from 'sequelize-typescript'
import { Note } from './note';
import { User } from './user';

const NoteUserIndex = createIndexDecorator({unique: true});

@Table
export class Author extends Model<Author> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column(DataType.STRING)
  color: string;

  @ForeignKey(() => Note)
  @NoteUserIndex
  @Column
  noteId: string;
  
  @BelongsTo(() => Note, { foreignKey: 'noteId', onDelete: 'CASCADE', constraints: false, hooks: true })
  note: Note;

  @ForeignKey(() => User)
  @NoteUserIndex
  @Column
  userId: string;

  @BelongsTo(() => User, { foreignKey: 'userId', onDelete: 'CASCADE', constraints: false, hooks: true })
  user: User;
}
