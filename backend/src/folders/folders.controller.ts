import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDTO } from './dto/create-folder.dto';
import { UpdateFolderDTO } from './dto/update-folder.dto';

@Controller('folders')
export class FoldersController {
    constructor(
        private readonly foldersService: FoldersService,
    ) { }

    // CRUD calls to foldersService go here 
}
