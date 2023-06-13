import { Injectable } from '@nestjs/common';
import { CreateMarkdownFileDTO } from './dto/create-markdown_file.dto';
import { UpdateMarkdownFileDTO } from './dto/update-markdown_file.dto';

@Injectable()
export class MarkdownFilesService {
  create(
    createMarkdownFileDTO: CreateMarkdownFileDTO,
  ) {
    return 'This action adds a new markdownFile';
  }

  findAll() {
    return `This action returns all markdownFiles`;
  }

  findOne(id: number) {
    return `This action returns the markdownFile with id: #${id}`;
  }

  update(
    id: number,
    updateMarkdownFileDTO: UpdateMarkdownFileDTO,
  ) {
    return `This action updates md file with id: #${id}`;
  }

  remove(id: number) {
    return `This action removes md file with id: #${id}`;
  }
}
