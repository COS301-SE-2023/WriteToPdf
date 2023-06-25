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

  create(
    createMarkdownFileDTO: MarkdownFileDTO,
  ): Promise<MarkdownFileDTO> {
    const newMarkdownFile =
      this.markdownFileRepository.save(
        createMarkdownFileDTO,
      );
    return newMarkdownFile;
  }

  async updateName(
    updateMarkdownFileDTO: MarkdownFileDTO,
  ): Promise<any> {
    const markdownFile =
      await this.markdownFileRepository.findOne({
        where: {
          MarkdownID:
            updateMarkdownFileDTO.MarkdownID,
        },
      });
    markdownFile.Name =
      updateMarkdownFileDTO.Name;

    return this.markdownFileRepository.save(
      markdownFile,
    );
  }

  async updatePath(
    updateMarkdownFileDTO: MarkdownFileDTO,
  ): Promise<any> {
    const markdownFile =
      await this.markdownFileRepository.findOne({
        where: {
          MarkdownID:
            updateMarkdownFileDTO.MarkdownID,
        },
      });
    markdownFile.Path =
      updateMarkdownFileDTO.Path;

    return this.markdownFileRepository.save(
      markdownFile,
    );
  }

  remove(
    removeMarkdownFileDTO: MarkdownFileDTO,
  ): Promise<any> {
    return this.markdownFileRepository.delete({
      MarkdownID:
        removeMarkdownFileDTO.MarkdownID,
    });
  }

  findAllByUserID(userID: number) {
    return this.markdownFileRepository.find({
      where: { UserID: userID },
    });
  }

  async updateLastModified(
    markdownDTO: MarkdownFileDTO,
  ) {
    let markdownToUpdate =
      await this.markdownFileRepository.findOneBy(
        {
          MarkdownID: markdownDTO.MarkdownID,
        },
      );
    markdownToUpdate = markdownDTO;
    markdownToUpdate.LastModified = new Date();
    return this.markdownFileRepository.save(
      markdownToUpdate,
    );
  }
}
