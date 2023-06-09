import { PartialType } from '@nestjs/mapped-types';
import { CreateMarkdownFileDto } from './create-markdown_file.dto';

export class UpdateMarkdownFileDto extends PartialType(
  CreateMarkdownFileDto,
) {}
