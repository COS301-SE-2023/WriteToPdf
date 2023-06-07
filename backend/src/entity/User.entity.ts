import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('USERS')
export class User {
  @PrimaryGeneratedColumn() // Auto-incremented
  UserID: number;

  @Column()
  Email: string;

  @Column()
  Password: string;
}
