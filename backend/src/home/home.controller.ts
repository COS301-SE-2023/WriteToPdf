import { Controller, Get } from '@nestjs/common';

@Controller('home')
export class HomeController {
  @Get()
  getHello(): string {
    return 'Hello from Home!';
  }
}
