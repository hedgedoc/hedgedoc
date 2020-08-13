import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm/index';
import { User } from './user.entity';

@Entity()
export class AuthToken {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    _ => User,
    user => user.authToken,
  )
  user: User;

  @Column()
  accessToken: string;
}
