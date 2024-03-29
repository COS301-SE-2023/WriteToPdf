import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { FoldersService } from '../../folders/folders.service';
import { MarkdownFileDTO } from '../../markdown_files/dto/markdown_file.dto';
import { MarkdownFilesService } from '../../markdown_files/markdown_files.service';
import { FolderDTO } from '../../folders/dto/folder.dto';
import { DirectoryFoldersDTO } from '../dto/directory_folders.dto';
import { DirectoryFilesDTO } from '../dto/directory_files.dto';
import { MarkdownFile } from '../../markdown_files/entities/markdown_file.entity';
import { Folder } from '../../folders/entities/folder.entity';
import { S3Service } from '../../s3/s3.service';
import { UsersService } from '../../users/users.service';
import { ExportDTO } from '../dto/export.dto';
import * as CryptoJS from 'crypto-js';
import { ConversionService } from '../../conversion/conversion.service';
import { ImportDTO } from '../dto/import.dto';
import { DiffsService } from '../../diffs/diffs.service';
import { SnapshotService } from '../../snapshots/snapshots.service';

@Injectable()
export class FileManagerServiceMock {
  constructor(
    private markdownFilesService: MarkdownFilesService,
    private folderService: FoldersService,
    private s3service: S3Service,
    private conversionService: ConversionService,
    private userService: UsersService,
    private diffsService: DiffsService,
    private snapshotService: SnapshotService,
  ) {}

  // File operations: ###########################################################

  // DB Requires the following fields to be initialised in the DTO:
  // Path: string; .. TO PLACE THE FILE IN S3
  // Name: string; .. THE NEW NAME OF THE FILE
  // Size: number; .. THE SIZE OF THE FILE IN MEGABYTES
  async createFile(
    markdownFileDTO: MarkdownFileDTO,
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

    if (markdownFileDTO.SafeLock === undefined)
      markdownFileDTO.SafeLock = false;

    await this.s3service.createFile(
      markdownFileDTO,
    );

    return this.markdownFilesService.create(
      markdownFileDTO,
    ); // return the file to know ID;
  }

  // DB Requires the following fields to be initialised in the DTO:
  async retrieveFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    if (markdownFileDTO.MarkdownID === undefined)
      throw new HttpException(
        'MarkdownID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    await this.s3service.retrieveFile(
      markdownFileDTO,
    );
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
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID =
        file.MarkdownID;
      markdownFileDTO.UserID = file.UserID;
      markdownFileDTO.DateCreated =
        file.DateCreated;
      markdownFileDTO.LastModified =
        file.LastModified;
      markdownFileDTO.Name = file.Name;
      markdownFileDTO.Path = file.Path;
      markdownFileDTO.Size = file.Size;
      markdownFileDTO.ParentFolderID =
        file.ParentFolderID;
      markdownFileDTO.Content = '';
      markdownFileDTO.SafeLock = false;
      markdownFileDTO.NewDiff = '';
      markdownFileDTO.NextDiffIndex =
        file.NextDiffIndex;
      markdownFileDTO.PreviousDiffs = [];
      markdownFileDTO.NextSnapshotIndex =
        file.NextSnapshotIndex;
      markdownFileDTO.TotalNumDiffs =
        file.TotalNumDiffs;
      markdownFileDTO.TotalNumSnapshots =
        file.TotalNumSnapshots;

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

  // DB Requires the following fields to be initialised in the DTO:
  // MarkdownID: string; .. TO IDENTIFY THE FILE
  // Path: string; .. TO LOCATE THE FILE in S3
  // Name: string; .. NEW NAME
  // Size: number; .. NEW SIZE
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

  // DB Requires the following fields to be initialised in the DTO:
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

  // DB Requires the following fields to be initialised in the DTO:
  async saveFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    if (markdownFileDTO.MarkdownID === undefined)
      throw new HttpException(
        'MarkdownID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    await this.s3service.saveFile(
      markdownFileDTO,
    );

    return this.markdownFilesService.updateAfterModification(
      markdownFileDTO,
    );
  }
  // DB Requires the following fields to be initialised in the DTO:
  // MarkdownID: string; .. TO IDENTIFY THE FILE
  // Path: string; .. TO LOCATE THE FILE IN S3
  // Name: string; .. TO IDENTIFY THE FILE
  async deleteFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    if (markdownFileDTO.MarkdownID === undefined)
      throw new HttpException(
        'MarkdownID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    await this.s3service.deleteFile(
      markdownFileDTO,
    );

    await this.s3service.deleteDiffObjectsForFile(
      markdownFileDTO,
    );

    await this.s3service.deleteSnapshotObjectsForFile(
      markdownFileDTO,
    );

    await this.diffsService.deleteDiffs(
      markdownFileDTO,
    );

    await this.snapshotService.deleteSnapshots(
      markdownFileDTO,
    );

    return this.markdownFilesService.remove(
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
  async importFile(importDTO: ImportDTO) {
    if (importDTO.Path === undefined)
      throw new HttpException(
        'Path cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );
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

    convertedMarkdownFileDTO.SafeLock = false;

    const createdFile = await this.createFile(
      convertedMarkdownFileDTO,
    );

    createdFile.Content = encryptedContent;

    const savedFile = await this.saveFile(
      createdFile,
    );

    const returnedDTO: MarkdownFileDTO = {
      ...savedFile,
      Content: encryptedContent,
      PreviousDiffs: [],
      NewDiff: '',
      NextDiffIndex: 0,
      clone: () => {
        return new MarkdownFileDTO();
      },
    };

    return returnedDTO;
  }

  decryptContent(
    content: string | undefined,
    encryptionKey: string,
  ): Promise<string> {
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
