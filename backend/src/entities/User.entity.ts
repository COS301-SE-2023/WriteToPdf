import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  UserID: number;

  @Column()
  email: string;

  @Column()
  password: string;
}
