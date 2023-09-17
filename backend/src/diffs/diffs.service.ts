import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Diff } from "./entities/diffs.entity";

@Injectable()
export class DiffsService {
  constructor(
    @InjectRepository(Diff)
    private diffRepository: Repository<Diff>,
  ) {}

  async updateDiff(nextDiffID: number) {
    const diff = await this.diffRepository.findOne({
      where: { S3DiffID: nextDiffID },
    });

    diff.LastModified = new Date();
    await this.diffRepository.save(diff);
  }
}
