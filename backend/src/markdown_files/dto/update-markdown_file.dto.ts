import { PartialType } from '@nestjs/mapped-types';
import { CreateMarkdownFileDTO } from './create-markdown_file.dto';

export class UpdateMarkdownFileDTO extends PartialType(
  CreateMarkdownFileDTO,
) {}
