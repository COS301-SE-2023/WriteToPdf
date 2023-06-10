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
  FirstName: string;

  @Column()
  LastName: string;

  @Column()
  Email: string;

  @Column()
  Password: string;
}
