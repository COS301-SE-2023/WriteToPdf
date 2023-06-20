import { Injectable } from '@nestjs/common';
import { MarkdownFileDTO } from './dto/markdown_file.dto';
import { MarkdownFile } from './entities/markdown_file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MarkdownFilesService {
  constructor(
    @InjectRepository(MarkdownFile)
    private markdownFileRepository: Repository<MarkdownFile>,
  ) {}

  create(createMarkdownFileDTO: MarkdownFileDTO) {
    const newMarkdownFile =
      this.markdownFileRepository.save(
        createMarkdownFileDTO,
      );
    return newMarkdownFile;
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

  async updateName(
    MarkdownID: string,
    updateMarkdownFileDTO: MarkdownFileDTO,
  ) {
    const markdownFile =
      await this.markdownFileRepository.findOne({
        where: { MarkdownID: MarkdownID },
      });
    markdownFile.Name =
      updateMarkdownFileDTO.Name;
    return this.markdownFileRepository.save(
      markdownFile,
    );
  }

  remove(removeMarkdownFileDTO: MarkdownFileDTO) {
    return this.markdownFileRepository.delete({
      MarkdownID:
        removeMarkdownFileDTO.MarkdownID,
    });
  }
}
