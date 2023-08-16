import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm';

@Entity('SHARE_REQUESTS')
export class ShareRequest {
  @PrimaryColumn()
  MarkdownID: string;

  @Column()
  SenderID: string;

  @Column()
  RecipientEmail: string;

  @Column()
  Status: string;

  @Column() // This field is set upon request rejection
  NextRequestTime: Date;
}
