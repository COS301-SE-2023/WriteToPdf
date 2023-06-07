import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from 'src/entity/User.entity';
import { Folder } from 'src/entity/Folder.entity';
import { MarkdownFile } from 'src/entity/MarkdownFile.entity';
import { Asset } from 'src/entity/Asset.entity';
import 'dotenv/config';

export const typeOrmConfig: TypeOrmModuleOptions =
  {
    type: process.env.DB_TYPE as any,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Folder, MarkdownFile, Asset],
    synchronize: true, // Set this to false in production to prevent automatic schema sync
  };
