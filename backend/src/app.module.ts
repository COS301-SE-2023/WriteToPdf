import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiTestModule } from './api-test/api-test.module';
import { TypeOrmModule } from '@nestjs/typeorm';

// Database connection credentials go in here
// need to manage password with AWS secrets

@Module({
    imports: [
      TypeOrmModule.forRoot({
        type: 'mariadb',
        host: 'YOUR_RDS_HOSTNAME',
        port: 3306,
        username: 'YOUR_USERNAME',
        password: 'YOUR_PASSWORD',
        database: 'YOUR_DATABASE_NAME',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Set to false in production to prevent automatic schema synchronization
      }),
      ApiTestModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}


