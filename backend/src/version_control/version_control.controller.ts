import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { VersionControlService } from './version_control.service';
import { DiffDTO } from 'src/diffs/dto/diffs.dto';

@Controller('version_control')
export class VersionControlController {
  constructor(
    private readonly versionControlService: VersionControlService,
  ) {}

  @Post('save_diff')
  saveDiff(@Body() diffDTO: DiffDTO) {
    this.versionControlService.saveDiff(diffDTO);
  }

  @Post('get_diff')
  getDiff(@Body() diffDTO: DiffDTO) {
    return this.versionControlService.getDiff(
      diffDTO,
    );
  }

  @Post('get_all_diffs')
  getAllDiffs() {
    return this.versionControlService.getAllDiffs();
  }

  @Post('save_snapshot')
  saveSnapshot() {
    this.versionControlService.saveSnapshot();
  }
}
