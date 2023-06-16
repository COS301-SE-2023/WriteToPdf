import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import 'dotenv/config';

export const testingModule = () => [
  TypeOrmModule.forRoot({
    type: process.env.DB_TYPE as any,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.TEST_DB_NAME,
    entities: ['../../dist/**/*entity.js'],
    synchronize: true, // Set this to false in production to prevent automatic schema sync
  }),
  TypeOrmModule.forFeature([User]),
];
