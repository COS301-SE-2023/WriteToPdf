import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { VersionControlService } from './version_control.service';
import { DiffDTO } from '../diffs/dto/diffs.dto';
import { SnapshotDTO } from '../snapshots/dto/snapshot.dto';
import { MarkdownFileDTO } from 'src/markdown_files/dto/markdown_file.dto';
import { VersionHistoryDTO } from './dto/version_history.dto';
import { version } from 'os';
import { SnapshotService } from '../snapshots/snapshots.service';
import { DiffsService } from '../diffs/diffs.service';

@Controller('version_control')
export class VersionControlController {
  constructor(
    private readonly versionControlService: VersionControlService,
    private readonly snapshotService: SnapshotService,
    private readonly diffService: DiffsService,
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

  ///===----------------------------------------------------

  @Post('get_all_snapshots')
  @HttpCode(HttpStatus.OK)
  getAllSnapshots(
    @Body() snapshotDTO: SnapshotDTO,
  ) {
    return this.versionControlService.getAllSnapshots(
      snapshotDTO,
    );
  }

  ///===----------------------------------------------------

  @Post('load_history')
  @HttpCode(HttpStatus.OK)
  async loadHistory(
    @Body() markdownFileDTO: MarkdownFileDTO,
  ) {
    const versionHistoryDTO =
      new VersionHistoryDTO();

    const snapshots =
      await this.snapshotService.getAllSnapshots(
        markdownFileDTO,
      );

    const snapshotDTOs =
      await this.versionControlService.convertSnapshotsToSnapshotDTOs(
        snapshots,
      );

    versionHistoryDTO.SnapshotHistory =
      snapshotDTOs;

    const diffs =
      await this.diffService.getAllDiffs(
        markdownFileDTO,
      );

    const diffDTOs =
      await this.versionControlService.convertDiffsToDiffDTOs(
        diffs,
      );

    versionHistoryDTO.DiffHistory = diffDTOs;
    return versionHistoryDTO;
  }
}
