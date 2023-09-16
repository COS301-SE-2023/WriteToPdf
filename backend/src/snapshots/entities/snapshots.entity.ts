import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm';

@Entity('SNAPSHOTS')
export class SNAPSHOT {
  @PrimaryColumn()
  SnapshotID: string;

  @Column()
  MarkdownID: string;

  @Column()
  UserID: string;

  @Column()
  DisplayID: string;

  @Column()
  S3SnapshotID: number;

  @Column('timestamp', {
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
  })
  LastModified: Date;
}
