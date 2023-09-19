import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diff } from './entities/diffs.entity';
import 'dotenv/config';
import * as CryptoJS from 'crypto-js';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { DiffDTO } from './dto/diffs.dto';

@Injectable()
export class DiffsService {
  constructor(
    @InjectRepository(Diff)
    private diffRepository: Repository<Diff>,
  ) {}

  async updateDiff(
    diffDTO: DiffDTO,
    nextDiffID: number,
  ) {
    const diff =
      await this.diffRepository.findOne({
        where: {
          MarkdownID: diffDTO.MarkdownID,
          S3DiffID: nextDiffID,
        },
      });

    diff.LastModified = new Date();
    diff.HasBeenUsed = true;
    await this.diffRepository.save(diff);
  }

  async createDiffs(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    const diffRecords = [];
    for (
      let i = 0;
      i < parseInt(process.env.MAX_DIFFS);
      i++
    ) {
      const diffID = CryptoJS.SHA256(
        markdownFileDTO.UserID.toString() +
          new Date().getTime().toString() +
          i.toString(),
      ).toString();

      diffRecords.push({
        DiffID: diffID,
        MarkdownID: markdownFileDTO.MarkdownID,
        UserID: markdownFileDTO.UserID,
        S3DiffID: i,
        HasBeenUsed: false,
      });
    }
    await this.diffRepository.insert(diffRecords);
  }

  async deleteDiffs(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    await this.diffRepository.delete({
      MarkdownID: markdownFileDTO.MarkdownID,
    });
  }

  async getAllDiffs(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    return await this.diffRepository.find({
      where: {
        MarkdownID: markdownFileDTO.MarkdownID,
        HasBeenUsed: true,
      },
    });
  }
}
