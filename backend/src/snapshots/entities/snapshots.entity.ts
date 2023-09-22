import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm';

@Entity('SNAPSHOTS')
export class Snapshot {
  @PrimaryColumn()
  SnapshotID: string;

  @Column()
  MarkdownID: string;

  @Column()
  UserID: number;

  @Column()
  S3SnapshotIndex: number;

  @Column('timestamp', {
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
  })
  LastModified: Date;

  @Column()
  HasBeenUsed: boolean;
}
