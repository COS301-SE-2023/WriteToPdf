import {
  DataSource,
  DataSourceOptions,
} from 'typeorm';

import 'dotenv/config';
import { MarkdownFile } from '../src/markdown_files/entities/markdown_file.entity';
import { User } from '../src/users/entities/user.entity';
import { Folder } from '../src/folders/entities/folder.entity';
import { Asset } from '../src/assets/entities/asset.entity';

export const dataSourceOptions: DataSourceOptions =
  {
    type: process.env.DB_TYPE as any,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // entities: ['dist/**/*.entity.js'],
    entities: [
      'dist/**/*.entity.{js,ts}',
      MarkdownFile,
      User,
      Folder,
      Asset,
    ],
    synchronize: true, // Set this to false in production to prevent automatic schema sync
  };

export const testDBOptions: DataSourceOptions = {
  type: process.env.DB_TYPE as any,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.TEST_DB_NAME,
  entities: ['dist/**/*.entity.js'],
  synchronize: true, // Set this to false in production to prevent automatic schema sync
};

const dataSource = new DataSource(
  dataSourceOptions,
);

const testDataSource = new DataSource(
  testDBOptions,
);

// export { dataSource, testDataSource};

export default dataSource;
