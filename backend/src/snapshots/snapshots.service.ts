import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Snapshot } from "./entities/snapshots.entity";

@Injectable()
export class SnapshotService {
  constructor(
    @InjectRepository(Snapshot)
    private snapshotRepository: Repository<Snapshot>,
  ) {}
}
