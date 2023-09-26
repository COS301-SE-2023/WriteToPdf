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
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { VersionHistoryDTO } from './dto/version_history.dto';
import { SnapshotService } from '../snapshots/snapshots.service';
import { DiffsService } from '../diffs/diffs.service';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { VersionSetDTO } from './dto/version_set.dto';
import { VersionRollbackDTO } from './dto/version_rollback.dto';

@Controller('version_control')
export class VersionControlController {
  constructor(
    private readonly versionControlService: VersionControlService,
    private readonly snapshotService: SnapshotService,
    private readonly diffService: DiffsService,
    private readonly markdownFileService: MarkdownFilesService,
  ) {}

  ///===----------------------------------------------------

  @Post('save_diff')
  async saveDiff(@Body() diffDTO: DiffDTO) {
    await this.versionControlService.saveDiff(
      diffDTO,
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

  @Post('get_history_set')
  @HttpCode(HttpStatus.OK)
  getHistorySet(
    @Body() versionSetDTO: VersionSetDTO,
  ) {
    return this.versionControlService.getHistorySet(
      versionSetDTO,
    );
  }

  ///===----------------------------------------------------

  @Post('get_snapshot')
  @HttpCode(HttpStatus.OK)
  async getSnapshot(
    @Body() snapshotDTO: SnapshotDTO,
  ) {
    return this.versionControlService.getSnapshot(
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
        markdownFileDTO.MarkdownID,
      );

    const diffDTOs =
      await this.versionControlService.convertDiffsToDiffDTOs(
        diffs,
      );

    versionHistoryDTO.DiffHistory = diffDTOs;
    return versionHistoryDTO;
  }

  ///===----------------------------------------------------

  @Post('rollback_version')
  @HttpCode(HttpStatus.OK)
  async rollbackVersion(
    @Body() versionRollbackDTO: VersionRollbackDTO,
  ) {
    return this.versionControlService.rollbackVersion(
      versionRollbackDTO,
    );
  }
}
