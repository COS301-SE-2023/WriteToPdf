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
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { VersionSetDTO } from './dto/version_set.dto';

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
  saveDiff(@Body() diffDTO: DiffDTO) {
    this.versionControlService.saveDiff(diffDTO);
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

  @Post('load_history')
  @HttpCode(HttpStatus.OK)
  async loadHistory(
    @Body() markdownFileDTO: MarkdownFileDTO,
  ) {
    const versionHistoryDTO =
      new VersionHistoryDTO();

    // Populate snapshot history

    const nextSnapshotID =
      await this.markdownFileService.getNextSnapshotID(
        markdownFileDTO.MarkdownID,
      );

    const snapshots =
      await this.snapshotService.getAllSnapshots(
        markdownFileDTO,
      );

    let snapshotDTOs =
      await this.versionControlService.convertSnapshotsToSnapshotDTOs(
        snapshots,
      );

    if (
      snapshotDTOs.length <
      parseInt(process.env.MAX_SNAPSHOTS)
    ) {
      const baseSnapshotDTO = 
        new SnapshotDTO();
      baseSnapshotDTO.MarkdownID =
        markdownFileDTO.MarkdownID;
      baseSnapshotDTO.OldestSnapshot = true;
      snapshotDTOs.unshift(baseSnapshotDTO);
    }

    if (
      snapshotDTOs.length ===
      parseInt(process.env.MAX_SNAPSHOTS)
    ) {
      snapshotDTOs =
        await this.snapshotService.getLogicalSnapshotOrder(
          snapshotDTOs,
          nextSnapshotID,
        );
    }

    versionHistoryDTO.SnapshotHistory =
      snapshotDTOs;

    // Populate diff history

    const nextDiffID =
      await this.markdownFileService.getNextDiffID(
        markdownFileDTO.MarkdownID,
      );

    const diffs =
      await this.diffService.getAllDiffs(
        markdownFileDTO.MarkdownID,
      );

    let diffDTOs =
      await this.versionControlService.convertDiffsToDiffDTOs(
        diffs,
      );

    if (
      diffDTOs.length ===
      parseInt(process.env.MAX_DIFFS)
    ) {
      diffDTOs =
        await this.diffService.getLogicalDiffOrder(
          diffDTOs,
          nextDiffID,
        );
    }

    versionHistoryDTO.DiffHistory = diffDTOs;
    //==-------------------------------
    console.log(
      'nextSnapshotID: ',
      nextSnapshotID,
    );
    console.log('nextDiffID: ', nextDiffID);
    console.log(versionHistoryDTO);
    //==-------------------------------
    return versionHistoryDTO;
  }
}
