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
  UserID: string; 

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
  LastModified: Date;

  @Column()
  Path: string;

  @Column()
  Size: number;

  @Column()
  ParentFolderID: string; // hash string
}
