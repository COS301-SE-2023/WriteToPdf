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
import { DiffsService } from '../diffs/diffs.service';
import { SnapshotService } from '../snapshots/snapshots.service';
import { ShareRequestDTO } from './dto/share_request.dto';

@Injectable()
export class FileManagerService {
  constructor(
    private markdownFilesService: MarkdownFilesService,
    private folderService: FoldersService,
    private s3service: S3Service,
    private conversionService: ConversionService,
    private userService: UsersService,
    private s3ServiceMock: S3ServiceMock,
    private diffsService: DiffsService,
    private snapshotService: SnapshotService,
  ) {}

  // File operations: ###########################################################
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

    if (
      markdownFileDTO.NextDiffIndex === undefined
    )
      markdownFileDTO.NextDiffIndex = 0;

    if (
      markdownFileDTO.NextSnapshotIndex ===
      undefined
    )
      markdownFileDTO.NextSnapshotIndex = 0;

    // Set to one to reflect that this function creates one diff and one snapshot
    if (
      markdownFileDTO.TotalNumDiffs === undefined
    )
      markdownFileDTO.TotalNumDiffs = 0;

    if (
      markdownFileDTO.TotalNumSnapshots ===
      undefined
    )
      markdownFileDTO.TotalNumSnapshots = 0;

    if (isTest) {
      await this.s3ServiceMock.createFile(
        markdownFileDTO,
      );
      const returnMD_DTO = new MarkdownFileDTO();
      returnMD_DTO.MarkdownID = 'testID';
      returnMD_DTO.Name = 'New Document';
      returnMD_DTO.Content = 'testContent';
      returnMD_DTO.Path = '';
      returnMD_DTO.DateCreated = new Date();
      returnMD_DTO.LastModified = new Date();
      returnMD_DTO.Size = 0;
      returnMD_DTO.ParentFolderID = '';
      returnMD_DTO.UserID = 0;
      return returnMD_DTO;
    } else {
      await this.s3service.createFile(
        markdownFileDTO,
      );

      await this.setupVersioningResources(
        markdownFileDTO,
      );
      markdownFileDTO.NextSnapshotIndex = 1;
      markdownFileDTO.TotalNumSnapshots = 1;
    }
    return await this.markdownFilesService.create(
      markdownFileDTO,
    );
  }

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
        NewDiff: '',
        PreviousDiffs: [],
        NextDiffIndex: file.NextDiffIndex,
        NextSnapshotIndex: file.NextSnapshotIndex,
        TotalNumDiffs: file.TotalNumDiffs,
        TotalNumSnapshots: file.TotalNumSnapshots,
        clone: this.getClone(),
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

      // TODO: decide on a return value here, otherwise two calls to remove md file are made
      // OR remove the mdservice.remove call from s3serviceMock.deleteFile
    } else {
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
      NextDiffIndex: 0,
      PreviousDiffs: [],
      NewDiff: '',
      clone: this.getClone(),
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

  async setupVersioningResources(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    // 1. Create snapshot reference in db
    await this.snapshotService.createSnapshot(
      markdownFileDTO,
    );

    // 2. Create snapshot reference in s3
    await this.s3service.createSnapshot(
      markdownFileDTO,
    );

    // 3. Create diff reference in db
    await this.diffsService.createDiff(
      markdownFileDTO,
      '', // No snapshot for this diff to build towards exists yet
    );

    // 4. Create diff reference in s3
    this.s3service.createDiff(markdownFileDTO);

    markdownFileDTO.NextSnapshotIndex = -1;

    // 5. Create redundant snapshot reference in db
    await this.snapshotService.createSnapshot(
      markdownFileDTO,
    );

    // 6. Create redundant snapshot reference in s3
    await this.s3service.createSnapshot(
      markdownFileDTO,
    );
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

  async shareFile(
    shareRequestDTO: ShareRequestDTO,
  ) {
    // If the markdown file does not exist, throw an error
    if (
      await !this.markdownFilesService.exists(
        shareRequestDTO.MarkdownID,
      )
    ) {
      throw new HttpException(
        'Markdown file not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    // If the recipient email does not exist, throw an error (handled by userService.findOneByEmail)
    const recipient =
      await this.userService.findOneByEmail(
        shareRequestDTO.RecipientEmail,
      );

    // Get the markdown file as a dto
    const originalFileDTO =
      await this.markdownFilesService.getAsDTO(
        shareRequestDTO.MarkdownID,
      );

    // Make a copy of the file
    const fileCopyDTO = originalFileDTO.clone();

    // Prepare the file to be added to the recipient's account
    fileCopyDTO.UserID = recipient.UserID;
    fileCopyDTO.MarkdownID = undefined;
    fileCopyDTO.Path = '';
    fileCopyDTO.ParentFolderID = '';
    fileCopyDTO.Name =
      fileCopyDTO.Name + ' (shared)';

    // Create the file in the recipient's account
    const createdFileDTO = await this.createFile(
      fileCopyDTO,
    );

    const s3Response =
      await this.s3service.copyFileContents(
        originalFileDTO.MarkdownID,
        shareRequestDTO.UserID,
        createdFileDTO.MarkdownID,
        recipient.UserID,
      );

    if (s3Response === undefined) {
      this.markdownFilesService.remove(
        createdFileDTO,
      );
      throw new HttpException(
        'Sharing failed',
        HttpStatus.BAD_REQUEST,
      );
    }

    createdFileDTO.Size = s3Response;
    this.markdownFilesService.updateSize(
      createdFileDTO,
    );

    // Return the created file
    return createdFileDTO;
  }
  private getClone() {
    return function () {
      const clone = new MarkdownFileDTO();
      clone.MarkdownID = this.MarkdownID;
      clone.UserID = this.UserID;
      clone.DateCreated = this.DateCreated;
      clone.LastModified = this.LastModified;
      clone.Name = this.Name;
      clone.Path = this.Path;
      clone.Size = this.Size;
      clone.ParentFolderID = this.ParentFolderID;
      clone.Content = this.Content;
      clone.SafeLock = this.SafeLock;
      clone.NewDiff = this.NewDiff;
      clone.PreviousDiffs = this.PreviousDiffs;
      clone.NextDiffIndex = this.NextDiffIndex;
      clone.NextSnapshotIndex =
        this.NextSnapshotIndex;
      clone.TotalNumDiffs = this.TotalNumDiffs;
      clone.TotalNumSnapshots =
        this.TotalNumSnapshots;
      return clone;
    };
  }
}
