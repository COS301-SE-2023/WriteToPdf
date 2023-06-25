import {
  Entity,
  Column,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity('FOLDERS')
export class Folder {
  @PrimaryColumn()
  FolderID: string;

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
  FolderName: string;

  @Column()
  Path: string;

  @Column()
  UserID: number;

  @JoinColumn()
  ParentFolderID: string;
}
