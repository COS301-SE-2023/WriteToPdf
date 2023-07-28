import { MarkdownFileDTO } from 'src/markdown_files/dto/markdown_file.dto';
import * as fs from 'fs/promises';
import * as CryptoJS from 'crypto-js';
import { AssetDTO } from 'src/assets/dto/asset.dto';

export class S3ServiceMock {
  async deleteFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    let filePath = '';
    if (markdownFileDTO.Path === '')
      filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;
    else
      filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`; // Local Storage: filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.Path}/${markdownFileDTO.MarkdownID}`;

    try {
      await fs.access(`./storage/${filePath}`);
    } catch (err) {
      console.log('Access Error (mock): ' + err);
      return undefined;
    }

    try {
      await fs.unlink(`./storage/${filePath}`);
    } catch (err) {
      console.log('Delete Error (mock): ' + err);
      return undefined;
    }

    return markdownFileDTO;
  }

  async createFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    const markdownID = CryptoJS.SHA256(
      markdownFileDTO.UserID.toString() +
        new Date().getTime().toString(),
    ).toString();
    markdownFileDTO.MarkdownID = markdownID;

    let filePath = '';
    if (markdownFileDTO.Path === '')
      filePath = `${markdownFileDTO.UserID}`;
    else filePath = `${markdownFileDTO.UserID}`; // Local Storage: filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.Path}`;

    try {
      await fs.mkdir(`./storage/${filePath}`, {
        recursive: true,
      });
    } catch (err) {
      console.log(
        'Directory Creation Error (mock): ' + err,
      );
      return undefined;
    }

    try {
      await fs.writeFile(
        `./storage/${filePath}/${markdownFileDTO.MarkdownID}`,
        '',
        'utf-8',
      );
    } catch (err) {
      console.log(
        'Write File Error (mock): ' + err,
      );
      return undefined;
    }

    markdownFileDTO.Content = '';
    markdownFileDTO.Size = 0;

    return markdownFileDTO;
  }

  async saveFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    let filePath = '';
    if (markdownFileDTO.Path === '')
      filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;
    else
      filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`; // Local Storage: filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.Path}/${markdownFileDTO.MarkdownID}`;

    try {
      await fs.access(`./storage/${filePath}`);
    } catch (err) {
      console.log('Access Error: ' + err);
      return undefined;
    }

    const fileData = new Uint8Array(
      Buffer.from(markdownFileDTO.Content),
    );

    try {
      await fs.writeFile(
        `./storage/${filePath}`,
        fileData,
        'utf-8',
      );
    } catch (err) {
      console.log(
        'Write File Error (mock): ' + err,
      );
      return undefined;
    }

    return markdownFileDTO;
  }

  async retrieveFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    let filePath = '';
    if (markdownFileDTO.Path === '')
      filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;
    else
      filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`; // Local Storage: filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.Path}/${markdownFileDTO.MarkdownID}`;

    try {
      await fs.access(`./storage/${filePath}`);
    } catch (err) {
      console.log(
        'Access Error (mock) --> ' + err,
      );
      return undefined;
    }

    try {
      markdownFileDTO.Content = await fs.readFile(
        `./storage/${filePath}`,
        {
          encoding: 'utf-8',
        },
      );
      markdownFileDTO.Size =
        markdownFileDTO.Content.length;
    } catch (err) {
      console.log(
        'Read File Error (mock):' + err,
      );
      return undefined;
    }

    const fileStats = await fs.stat(
      `./storage/${filePath}`,
    );
    markdownFileDTO.DateCreated =
      fileStats.birthtime;
    markdownFileDTO.LastModified =
      fileStats.mtime;

    return markdownFileDTO;
  }

  async saveAsset(saveAssetDTO: AssetDTO) {
    let filePath = `${saveAssetDTO.UserID}`;

    try {
      await fs.mkdir(`./storage/${filePath}`, {
        recursive: true,
      });
    } catch (err) {
      console.log(
        'Directory Creation Error (mock): ' + err,
      );
      return undefined;
    }

    const fileData = new Uint8Array(
      Buffer.from(saveAssetDTO.Content),
    );

    filePath = `${saveAssetDTO.UserID}/${saveAssetDTO.AssetID}`;

    try {
      await fs.writeFile(
        `./storage/${filePath}`,
        fileData,
        'utf-8',
      );
    } catch (err) {
      console.log(
        'Write File Error (mock): ' + err,
      );
      return undefined;
    }

    saveAssetDTO.Size =
      fileData.buffer.byteLength;
    saveAssetDTO.Content = '';
    return saveAssetDTO;
  }

  async retrieveAssetByID(
    assetID: string,
    userID: number,
  ) {
    const retrieveAssetDTO = new AssetDTO();

    let filePath = `${userID}`;

    try {
      await fs.access(`./storage/${filePath}`);
    } catch (err) {
      console.log(
        'Access Error (mock) --> ' + err,
      );
      return undefined;
    }

    filePath += `/${assetID}`;

    try {
      retrieveAssetDTO.Content =
        await fs.readFile(
          `./storage/${filePath}`,
          {
            encoding: 'utf-8',
          },
        );
      retrieveAssetDTO.Size =
        retrieveAssetDTO.Content.length;
    } catch (err) {
      console.log(
        'Read File Error (mock):' + err,
      );
      return undefined;
    }
    return retrieveAssetDTO;
  }

  async retrieveAsset(
    retrieveAssetDTO: AssetDTO,
  ) {
    let filePath = `${retrieveAssetDTO.UserID}`;

    try {
      await fs.access(`./storage/${filePath}`);
    } catch (err) {
      console.log(
        'Access Error (mock) --> ' + err,
      );
      return undefined;
    }

    filePath += `/${retrieveAssetDTO.AssetID}`;

    try {
      retrieveAssetDTO.Content =
        await fs.readFile(
          `./storage/${filePath}`,
          {
            encoding: 'utf-8',
          },
        );
      retrieveAssetDTO.Size =
        retrieveAssetDTO.Content.length;
    } catch (err) {
      console.log(
        'Read File Error (mock):' + err,
      );
      return undefined;
    }
    return retrieveAssetDTO;
  }

  async deleteAsset(assetDTO: AssetDTO) {
    let filePath = `${assetDTO.UserID}`;

    try {
      await fs.access(`./storage/${filePath}`);
    } catch (err) {
      console.log(
        'Access Error (mock) --> ' + err,
      );
      return undefined;
    }

    filePath += `/${assetDTO.AssetID}`;

    try {
      await fs.unlink(`./storage/${filePath}`);
    } catch (err) {
      console.log(
        'Delete Error (mock) --> ' + err,
      );
      return undefined;
    }
    return assetDTO;
  }
}
