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
    precision: 3,
    default: () =>
      `DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL 24 HOUR)`,
  })
  DateExpires: Date;
}
