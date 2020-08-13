import { ISession } from 'connect-typeorm';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm/index';

@Entity()
export class Session implements ISession {
  @PrimaryColumn('varchar', { length: 255 })
  public id = '';

  @Index()
  @Column('bigint')
  public expiredAt = Date.now();

  @Column('text')
  public json = '';
}
