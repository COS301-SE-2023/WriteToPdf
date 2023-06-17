import { Injectable } from '@nestjs/common';
import { MarkdownFileDTO } from './dto/markdown_file.dto';

@Injectable()
export class MarkdownFilesService {
  create(createMarkdownFileDTO: MarkdownFileDTO) {
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
    updateMarkdownFileDTO: MarkdownFileDTO,
  ) {
    return `This action updates md file with id: #${MarkdownID}`;
  }

  remove(MarkdownID: string) {
    return `This action removes md file with id: #${MarkdownID}`;
  }
}
