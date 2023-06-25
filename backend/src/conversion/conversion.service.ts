import { Injectable } from '@nestjs/common';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { ImportDTO } from '../file_manager/dto/import.dto';
import { convertTextToDelta } from 'node-quill-converter';

@Injectable()
export class ConversionService {
  constructor() {
    /* empty */
  }

  convertFrom(
    importDTO: ImportDTO,
  ): MarkdownFileDTO {
    if (importDTO.Type === 'txt') {
      return this.convertFromText(importDTO);
    }
  }

  convertFromText(
    textDTO: ImportDTO,
  ): MarkdownFileDTO {
    const delta = convertTextToDelta(
      textDTO.Content,
    );

    const markdownFileDTO = new MarkdownFileDTO();
    markdownFileDTO.Content =
      JSON.stringify(delta);
    markdownFileDTO.Name = textDTO.Name;
    markdownFileDTO.Path = textDTO.Path;
    markdownFileDTO.ParentFolderID =
      textDTO.ParentFolderID;
    markdownFileDTO.UserID = textDTO.UserID;
    return markdownFileDTO;
  }
}
