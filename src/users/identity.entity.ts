import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm/index';
import { User } from './user.entity';

@Entity()
export class Identity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    _ => User,
    user => user.identities,
  )
  user: User;

  @Column()
  providerName: string;

  @Column()
  syncSource: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    nullable: true,
  })
  providerUserId?: string;

  @Column({
    nullable: true,
  })
  oAuthAccessToken?: string;

  @Column({
    nullable: true,
  })
  passwordHash?: string;
}
