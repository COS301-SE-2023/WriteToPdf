import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TextManagerService } from './text_manager.service';
import { CreateTextManagerDto } from './dto/create-text_manager.dto';
import { UpdateTextManagerDto } from './dto/update-text_manager.dto';

@Controller('text-manager')
export class TextManagerController {
  constructor(
    private readonly textManagerService: TextManagerService,
  ) {}

  @Post()
  create(
    @Body()
    createTextManagerDto: CreateTextManagerDto,
  ) {
    return this.textManagerService.create(
      createTextManagerDto,
    );
  }

  @Get()
  findAll() {
    return this.textManagerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.textManagerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateTextManagerDto: UpdateTextManagerDto,
  ) {
    return this.textManagerService.update(
      +id,
      updateTextManagerDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.textManagerService.remove(+id);
  }
}
