import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

@Entity('FOLDERS')
export class Folder {
  @PrimaryGeneratedColumn()
  FolderID: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  DateCreated: Date;

  @Column()
  FolderName: string;

  @Column()
  Path: string;

  @JoinColumn()
  ParentFolderID: string;
}
