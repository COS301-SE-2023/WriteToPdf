import { Injectable } from '@nestjs/common';
import { CreateMarkdownFileDto } from './dto/create-markdown_file.dto';
import { UpdateMarkdownFileDto } from './dto/update-markdown_file.dto';

@Injectable()
export class MarkdownFilesService {
  create(
    createMarkdownFileDto: CreateMarkdownFileDto,
  ) {
    return 'This action adds a new markdownFile';
  }

  findAll() {
    return `This action returns all markdownFiles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} markdownFile`;
  }

  update(
    id: number,
    updateMarkdownFileDto: UpdateMarkdownFileDto,
  ) {
    return `This action updates a #${id} markdownFile`;
  }

  remove(id: number) {
    return `This action removes a #${id} markdownFile`;
  }
}
