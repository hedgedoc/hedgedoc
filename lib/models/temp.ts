import { DataType, Model, Table, PrimaryKey, Column, Default } from 'sequelize-typescript'
import { generate as shortIdGenerate } from 'shortid'

@Table
export class Temp extends Model<Temp> {
  @Default(shortIdGenerate)
  @PrimaryKey
  @Column(DataType.STRING)
  id: string;

  @Column(DataType.TEXT)
  data: string
}
