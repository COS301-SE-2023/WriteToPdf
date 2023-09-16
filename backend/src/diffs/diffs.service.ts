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
}
