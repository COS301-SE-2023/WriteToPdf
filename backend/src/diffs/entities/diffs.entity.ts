import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm';

@Entity('DIFFS')
export class Diff {
  @PrimaryColumn()
  DiffID: string;

  @Column()
  MarkdownID: string;

  @Column()
  UserID: number;

  @Column()
  S3DiffID: number;

  @Column('timestamp', {
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
  })
  LastModified: Date;

  @Column()
  HasBeenUsed: boolean;

  @Column()
  SnapshotID: string;
}
