import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm';

@Entity('RESET_PASSWORD_REQUESTS')
export class ResetPasswordRequest {
  @PrimaryColumn()
  UserID: number;

  @Column()
  Token: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  DateCreated: Date;

  @Column('timestamp', {
    default: () =>
      `DATE_ADD(DateCreated, INTERVAL 24 HOUR)`,
  })
  DateExpires: Date;
}
