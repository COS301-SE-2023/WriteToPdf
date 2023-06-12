import {
  DataSource,
  DataSourceOptions,
} from 'typeorm';

import 'dotenv/config';

export const dataSourceOptions: DataSourceOptions =
  {
    type: process.env.DB_TYPE as any,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ['dist/**/*entity.js'],
    synchronize: true, // Set this to false in production to prevent automatic schema sync
  };

const dataSource = new DataSource(
  dataSourceOptions,
);
export default dataSource;
