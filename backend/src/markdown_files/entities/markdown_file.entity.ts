import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm';

@Entity('MARKDOWN_FILES')
export class MarkdownFile {
  @PrimaryColumn()
  MarkdownID: string; // hash string

  @Column()
  UserID: number;

  @Column()
  Name: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  DateCreated: Date;

  @Column('timestamp', {
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
  })
  LastModified: Date;

  @Column()
  Path: string;

  @Column()
  Size: number;

  @Column()
  SafeLock: boolean;

  @Column()
  ParentFolderID: string; // hash string

  @Column()
  NextDiffID: number;

  @Column()
  NextSnapshotID: number;
}
