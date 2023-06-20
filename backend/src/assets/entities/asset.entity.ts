import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

@Entity('ASSETS')
export class Asset {
  @PrimaryGeneratedColumn()
  AssetID: string;

  @Column()
  Format: string;

  @Column()
  FileName: string;

  @Column()
  ConvertedElement: string;

  @Column()
  Image: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  DateCreated: Date;

  @Column({
    type: 'float',
    precision: 8,
    scale: 2, // 8 digits in total, 2 after the decimal point
  })
  Size: number;

  @JoinColumn()
  ParentFolderID: string;
}
