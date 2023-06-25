import { Injectable } from '@nestjs/common';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { ImportDTO } from '../file_manager/dto/import.dto';
import { ExportDTO } from '../file_manager/dto/export.dto';
import {
  convertTextToDelta,
  convertDeltaToHtml,
} from 'node-quill-converter';
import { convert } from 'html-to-text';

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

  convertTo(exportDTO: ExportDTO) {
    if (exportDTO.Type === 'txt') {
      return this.convertToTxt(exportDTO);
    }
  }

  convertFromText(textDTO: ImportDTO) {
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

  convertToTxt(markdownDTO: ExportDTO) {
    const html = convertDeltaToHtml(
      JSON.parse(markdownDTO.Content),
    );

    const text = convert(html, {
      wordwrap: false,
    });

    const textDTO = new ExportDTO();
    textDTO.Content = text;
    textDTO.Name = markdownDTO.Name;
    textDTO.Type = markdownDTO.Type;
    textDTO.UserID = markdownDTO.UserID;
    return textDTO;
  }
}
