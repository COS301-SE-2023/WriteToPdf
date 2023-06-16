import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

@Entity('MARKDOWN_FILES')
export class MarkdownFile {
  @PrimaryGeneratedColumn()
  MarkdownID: string; // hash string

  @Column()
  Name: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  DateCreated: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  LastModified: string;

  @Column()
  Path: string;

  @Column()
  Size: number;

  @JoinColumn()
  ParentFolderID: string; // hash string
}
