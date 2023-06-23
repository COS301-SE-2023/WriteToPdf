import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('MARKDOWN_FILES')
export class MarkdownFile {
  @PrimaryGeneratedColumn()
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
  ParentFolderID: string; // hash string
}
