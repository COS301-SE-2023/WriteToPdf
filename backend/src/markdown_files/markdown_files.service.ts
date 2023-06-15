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

  findOne(MarkdownID: string) {
    return `This action returns the markdownFile with id: #${MarkdownID}`;
  }

  update(
    MarkdownID: string,
    updateMarkdownFileDTO: UpdateMarkdownFileDTO,
  ) {
    return `This action updates md file with id: #${MarkdownID}`;
  }

  remove(MarkdownID: string) {
    return `This action removes md file with id: #${MarkdownID}`;
  }
}
