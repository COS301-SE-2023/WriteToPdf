import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { VersionControlService } from './version_control.service';
import { DiffDTO } from '../diffs/dto/diffs.dto';
import { SnapshotDTO } from '../snapshots/dto/snapshot.dto';

@Controller('version_control')
export class VersionControlController {
  constructor(
    private readonly versionControlService: VersionControlService,
  ) {}

  ///===----------------------------------------------------

  @Post('save_diff')
  saveDiff(@Body() diffDTO: DiffDTO) {
    this.versionControlService.saveDiff(diffDTO);
  }

  ///===----------------------------------------------------

  @Post('get_diff')
  getDiff(@Body() diffDTO: DiffDTO) {
    return this.versionControlService.getDiff(
      diffDTO,
    );
  }

  ///===----------------------------------------------------

  @Post('get_all_diffs')
  getAllDiffs(@Body() snapshotDTO: SnapshotDTO) {
    return this.versionControlService.getAllDiffsForSnapshot(
      snapshotDTO,
    );
  }

  ///===----------------------------------------------------

  @Post('save_snapshot')
  saveSnapshot(@Body() snapshotDTO: SnapshotDTO) {
    this.versionControlService.saveSnapshot(
      snapshotDTO,
    );
  }
}
