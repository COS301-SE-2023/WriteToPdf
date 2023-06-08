import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiTestModule } from './api-test/api-test.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { LoginController } from './login/login.controller';
import { LoginModule } from './login/login.module';
import { SignupController } from './signup/signup.controller';
import { SignupModule } from './signup/signup.module';
import { HomeController } from './home/home.controller';
import { HomeModule } from './home/home.module';
import { EditController } from './edit/edit.controller';
import { EditModule } from './edit/edit.module';
import { DatabaseController } from './database/database.controller';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ApiTestModule,
    AuthModule,
    LoginModule,
    SignupModule,
    HomeModule,
    EditModule,
    DatabaseModule,
  ],
  controllers: [
    AppController,
    AuthController,
    LoginController,
    SignupController,
    HomeController,
    EditController,
    DatabaseController,
  ],
  providers: [AppService],
})
export class AppModule {}
