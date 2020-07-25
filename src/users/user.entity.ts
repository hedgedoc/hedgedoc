import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  //TODO: Still missing many properties
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
