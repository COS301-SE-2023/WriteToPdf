import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { FoldersService } from '../folders/folders.service';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { FolderDTO } from '../folders/dto/folder.dto';
import { DirectoryFoldersDTO } from './dto/directory_folders.dto';
import { DirectoryFilesDTO } from './dto/directory_files.dto';
import { MarkdownFile } from '../markdown_files/entities/markdown_file.entity';
import { Folder } from '../folders/entities/folder.entity';
import { S3Service } from '../s3/s3.service';
import { S3ServiceMock } from '../s3/__mocks__/s3.service';
import { UsersService } from '../users/users.service';
import { ExportDTO } from './dto/export.dto';
import * as CryptoJS from 'crypto-js';
import { ConversionService } from '../conversion/conversion.service';
import { ImportDTO } from './dto/import.dto';

@Injectable()
export class FileManagerService {
  constructor(
    private markdownFilesService: MarkdownFilesService,
    private folderService: FoldersService,
    private s3service: S3Service,
    private conversionService: ConversionService,
    private userService: UsersService,
    private s3ServiceMock: S3ServiceMock,
  ) {}

  // File operations: ###########################################################

  // DB Requires the following fields to be initialised in the DTO:
  // Path: string; .. TO PLACE THE FILE IN S3
  // Name: string; .. THE NEW NAME OF THE FILE
  // Size: number; .. THE SIZE OF THE FILE IN MEGABYTES
  async createFile(
    markdownFileDTO: MarkdownFileDTO,
    isTest = false,
  ) {
    if (markdownFileDTO.UserID === undefined)
      throw new HttpException(
        'UserID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (markdownFileDTO.Path === undefined)
      markdownFileDTO.Path = '';

    if (
      markdownFileDTO.ParentFolderID === undefined
    )
      markdownFileDTO.ParentFolderID = '';

    if (markdownFileDTO.Name === undefined)
      markdownFileDTO.Name = 'New Document';

    if (markdownFileDTO.Size === undefined)
      markdownFileDTO.Size = 0;

    if (markdownFileDTO.NextDiffID === undefined)
      markdownFileDTO.NextDiffID = 0;

    if (
      markdownFileDTO.NextSnapshotID === undefined
    )
      markdownFileDTO.NextSnapshotID = 0;

    if (isTest) {
      await this.s3ServiceMock.createFile(
        markdownFileDTO,
      );
    } else {
      await this.s3service.createFile(
        markdownFileDTO,
      );
    }

    return await this.markdownFilesService.create(
      markdownFileDTO,
    ); // return the file to know ID;
  }

  // This function will need to return the latest diffs for
  // the specified file (at most, 10 diffs)
  async retrieveFile(
    markdownFileDTO: MarkdownFileDTO,
    isTest = false,
  ) {
    if (markdownFileDTO.MarkdownID === undefined)
      throw new HttpException(
        'MarkdownID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (isTest) {
      await this.s3ServiceMock.retrieveFile(
        markdownFileDTO,
      );
    } else {
      await this.s3service.retrieveFile(
        markdownFileDTO,
      );
    }
    return markdownFileDTO; // return the file
  }

  /**
   * @param files An array of MarkdownFile entities
   * @returns An array of MarkdownFileDTOs
   */
  convertFilesToDTOs(
    files: MarkdownFile[],
  ): MarkdownFileDTO[] {
    const markdownFilesDTOArr: MarkdownFileDTO[] =
      [];
    files.forEach((file) => {
      const markdownFileDTO: MarkdownFileDTO = {
        MarkdownID: file.MarkdownID,
        UserID: file.UserID,
        DateCreated: file.DateCreated,
        LastModified: file.LastModified,
        Name: file.Name,
        Path: file.Path,
        Size: file.Size,
        ParentFolderID: file.ParentFolderID,
        Content: '',
        SafeLock: file.SafeLock,
        PreviousDiffs: [],
        NextDiffID: 0,
        NewDiff: '',
      };
      markdownFilesDTOArr.push(markdownFileDTO);
    });
    return markdownFilesDTOArr;
  }

  async retrieveAllFiles(
    directoryFilesDTO: DirectoryFilesDTO,
  ) {
    if (directoryFilesDTO.UserID === undefined)
      throw new HttpException(
        'UserID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    const allFiles =
      await this.markdownFilesService.findAllByUserID(
        directoryFilesDTO.UserID,
      );
    directoryFilesDTO.Files =
      this.convertFilesToDTOs(allFiles);
    return directoryFilesDTO;
  }

  renameFile(markdownFileDTO: MarkdownFileDTO) {
    if (markdownFileDTO.MarkdownID === undefined)
      throw new HttpException(
        'MarkdownID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (markdownFileDTO.UserID === undefined)
      throw new HttpException(
        'UserID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (markdownFileDTO.Name === undefined)
      throw new HttpException(
        'Name cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    return this.markdownFilesService.updateName(
      markdownFileDTO,
    );
  }

  async moveFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    if (markdownFileDTO.MarkdownID === undefined)
      throw new HttpException(
        'MarkdownID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (markdownFileDTO.Path === undefined)
      throw new HttpException(
        'Path cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (
      markdownFileDTO.ParentFolderID === undefined
    )
      throw new HttpException(
        'ParentFolderID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (markdownFileDTO.UserID === undefined)
      throw new HttpException(
        'UserID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    return await this.markdownFilesService.updatePath(
      markdownFileDTO,
    );
  }

  async saveFile(
    markdownFileDTO: MarkdownFileDTO,
    isTest = false,
  ) {
    markdownFileDTO.Size =
      markdownFileDTO.Content.length;
    if (markdownFileDTO.MarkdownID === undefined)
      throw new HttpException(
        'MarkdownID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (isTest) {
      await this.s3ServiceMock.saveFile(
        markdownFileDTO,
      );
    } else {
      await this.s3service.saveFile(
        markdownFileDTO,
      );
    }

    // Assuming frontend will send the NextDiffID

    return await this.markdownFilesService.updateAfterModification(
      markdownFileDTO,
    );
  }

  async deleteFile(
    markdownFileDTO: MarkdownFileDTO,
    isTest = false,
  ) {
    if (markdownFileDTO.MarkdownID === undefined)
      throw new HttpException(
        'MarkdownID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (isTest) {
      await this.s3ServiceMock.deleteFile(
        markdownFileDTO,
      );
    } else {
      await this.s3service.deleteFile(
        markdownFileDTO,
      );
    }

    return this.markdownFilesService.remove(
      markdownFileDTO,
    );
  }

  updateSafeLockStatus(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    return this.markdownFilesService.updateSafeLockStatus(
      markdownFileDTO,
    );
  }

  // Folder operations: #########################################################
  createFolder(folderDTO: FolderDTO) {
    if (folderDTO.FolderName === undefined)
      throw new HttpException(
        'FolderName cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (folderDTO.UserID === undefined)
      throw new HttpException(
        'UserID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (folderDTO.ParentFolderID === undefined)
      throw new HttpException(
        'ParentFolderID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (folderDTO.Path === undefined)
      throw new HttpException(
        'Path cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (folderDTO.FolderName === '') {
      throw new HttpException(
        'FolderName cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.folderService.create(folderDTO);
  }

  convertFoldersToDTOs(folders: Folder[]) {
    const folderDTOArr: FolderDTO[] = [];
    folders.forEach((folder) => {
      const folderDTO: FolderDTO = {
        FolderID: folder.FolderID,
        UserID: folder.UserID,
        DateCreated: folder.DateCreated,
        LastModified: folder.LastModified,
        FolderName: folder.FolderName,
        Path: folder.Path,
        ParentFolderID: folder.ParentFolderID,
      };
      folderDTOArr.push(folderDTO);
    });
    return folderDTOArr;
  }

  async retrieveAllFolders(
    directoryFoldersDTO: DirectoryFoldersDTO,
  ) {
    if (
      directoryFoldersDTO.UserID === undefined
    ) {
      throw new HttpException(
        'UserID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );
    }

    const allFolders =
      await this.folderService.findAllByUserID(
        directoryFoldersDTO.UserID,
      );
    directoryFoldersDTO.Folders =
      this.convertFoldersToDTOs(allFolders);
    return directoryFoldersDTO;
  }

  renameFolder(folderDTO: FolderDTO) {
    if (folderDTO.FolderID === undefined)
      throw new HttpException(
        'FolderID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (folderDTO.FolderName === undefined)
      throw new HttpException(
        'FolderName cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    return this.folderService.updateName(
      folderDTO,
    );
  }

  moveFolder(folderDTO: FolderDTO) {
    if (folderDTO.FolderID === undefined)
      throw new HttpException(
        'FolderID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (folderDTO.ParentFolderID === undefined)
      throw new HttpException(
        'ParentFolderID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (folderDTO.Path === undefined)
      throw new HttpException(
        'Path cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    return this.folderService.updatePath(
      folderDTO,
    );
  }

  deleteFolder(folderDTO: FolderDTO) {
    if (folderDTO.FolderID === undefined)
      throw new HttpException(
        'FolderID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    return this.folderService.remove(folderDTO);
  }

  // Import & Export operations: #########################################################
  async importFile(
    importDTO: ImportDTO,
    isTest = false,
  ) {
    const encryptionKey =
      await this.getEncryptionKey(
        importDTO.UserID,
      );

    importDTO.Content = await this.decryptContent(
      importDTO.Content,
      encryptionKey,
    );

    let convertedHtml: string | undefined;
    // if (importDTO.Type === 'pdf') {
    //   convertedHtml =
    //     await this.conversionService.convertPdfToHtml(
    //       importDTO.Content,
    //     );
    // } else
    if (importDTO.Type === 'txt') {
      convertedHtml =
        this.conversionService.convertTxtToHtml(
          importDTO.Content,
        );
    } else if (importDTO.Type === 'md') {
      convertedHtml =
        this.conversionService.convertMdToHtml(
          importDTO.Content,
        );
    } else {
      throw new HttpException(
        'Invalid file type',
        HttpStatus.BAD_REQUEST,
      );
    }

    // console.log('convertedHtml: ', convertedHtml);

    const encryptedContent =
      await this.encryptContent(
        convertedHtml,
        encryptionKey,
      );

    const convertedMarkdownFileDTO =
      new MarkdownFileDTO();

    convertedMarkdownFileDTO.UserID =
      importDTO.UserID;
    convertedMarkdownFileDTO.Path =
      importDTO.Path;
    convertedMarkdownFileDTO.ParentFolderID =
      importDTO.ParentFolderID;
    convertedMarkdownFileDTO.Name =
      importDTO.Name;
    convertedMarkdownFileDTO.Content =
      convertedHtml;

    const createdFile = await this.createFile(
      convertedMarkdownFileDTO,
      isTest,
    );

    createdFile.Content = encryptedContent;

    const savedFile = await this.saveFile(
      createdFile,
      isTest,
    );

    // Imported file is considered new, so it has no diffs
    const returnedDTO: MarkdownFileDTO = {
      ...savedFile,
      Content: encryptedContent,
      NextDiffID: 0,
      PreviousDiffs: [],
      NewDiff: '',
    };

    return returnedDTO;
  }

  decryptContent(
    content: string | undefined,
    encryptionKey: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (content) {
        resolve(content);
        return;
      }
    });
    const decryptedMessage = CryptoJS.AES.decrypt(
      content,
      encryptionKey,
    )
      .toString(CryptoJS.enc.Utf8)
      .replace(/^"(.*)"$/, '$1');
    return decryptedMessage;
  }

  encryptContent(
    content: string,
    encryptionKey: string,
  ) {
    return content;
    const encryptedMessage = CryptoJS.AES.encrypt(
      content,
      encryptionKey,
    ).toString();
    return encryptedMessage;
  }

  async getEncryptionKey(
    UserID: number,
  ): Promise<string> {
    const user = await this.userService.findOne(
      UserID,
    );

    const encryptionKey = CryptoJS.SHA256(
      user.Password,
    ).toString();

    return encryptionKey;
  }

  async exportFile(exportDTO: ExportDTO) {
    if (exportDTO.MarkdownID === undefined)
      throw new HttpException(
        'MarkdownID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (exportDTO.Content === undefined) {
      // Idea for future: if content is undefined, retrieve it from the storage
      // const markdownFile =
      //   await this.markdownFilesService.findOneByMarkdownID(
      //     exportDTO.MarkdownID,
      //   );

      // if (markdownFile === undefined) {
      throw new HttpException(
        'Content cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );
      // }

      // exportDTO.Content = markdownFile.Content;
    }

    const encryptionKey =
      await this.getEncryptionKey(
        exportDTO.UserID,
      );

    // decrypt content
    // exportDTO.Content = await this.decryptContent(
    //   exportDTO.Content,
    //   encryptionKey,
    // );

    // convert
    if (exportDTO.Type === 'pdf') {
      const pdfBuffer =
        await this.conversionService.generatePdf(
          exportDTO.Content,
        );
      return pdfBuffer;
    } else if (exportDTO.Type === 'txt') {
      const txt =
        this.conversionService.convertHtmlToTxt(
          exportDTO.Content,
        );
      const txtBuffer = Buffer.from(txt);
      return txtBuffer;
    } else if (exportDTO.Type === 'md') {
      const md =
        this.conversionService.convertHtmlToMarkdown(
          exportDTO.Content,
        );
      const mdBuffer = Buffer.from(md);
      return mdBuffer;
    } else if (exportDTO.Type === 'jpeg') {
      const jpegBuffer =
        await this.conversionService.convertHtmlToJpeg(
          exportDTO.Content,
        );
      return jpegBuffer;
    } else if (exportDTO.Type === 'png') {
      const pngBuffer =
        await this.conversionService.convertHtmlToPng(
          exportDTO.Content,
        );
      return pngBuffer;
    } else {
      throw new HttpException(
        'Invalid export type',
        HttpStatus.BAD_REQUEST,
      );
    }
    // re-encrypt content
    // const converted = await this.encryptContent(
    //   (await pdfBuffer).toString(),
    //   encryptionKey,
    // );
  }

  // async generatePdf(html: string) {
  //   const browser = await puppeteer.launch();
  //   const page = await browser.newPage();

  //   // Emulate a screen to apply CSS styles correctly
  //   await page.setViewport({
  //     width: 1920,
  //     height: 1080,
  //   });

  //   await page.setContent(html, {
  //     waitUntil: 'networkidle0',
  //   });

  //   // Set a higher scale to improve quality (e.g., 2 for Retina displays)
  //   const pdf = await page.pdf({
  //     format: 'A4',
  //     scale: 1,
  //     printBackground: true,
  //   });

  //   await browser.close();

  //   // Send the generated PDF as a response
  //   return pdf;
  // }
}
