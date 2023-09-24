import { Injectable } from '@nestjs/common';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import 'dotenv/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
// import * as fs from 'fs/promises'; // for local storage
import * as CryptoJS from 'crypto-js';
import { AssetDTO } from '../assets/dto/asset.dto';
import { DiffDTO } from '../diffs/dto/diffs.dto';
import { SnapshotDTO } from '../snapshots/dto/snapshot.dto';

@Injectable()
export class S3Service {
  awsS3BucketName =
    process.env.AWS_S3_BUCKET_NAME;
  awsS3BucketRegion =
    process.env.AWS_S3_BUCKET_REGION;
  awsS3AccessKeyId =
    process.env.AWS_S3_ACCESS_KEY_ID;
  awsS3SecretAccessKey =
    process.env.AWS_S3_SECRET_ACCESS_KEY;

  ///===----------------------------------------------------

  private readonly s3Client = new S3Client({
    credentials: {
      accessKeyId: this.awsS3AccessKeyId,
      secretAccessKey: this.awsS3SecretAccessKey,
    },
    region: this.awsS3BucketRegion,
  });

  ///===----------------------------------------------------

  async deleteFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    console.log('Delete File (s3)');
    const filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;

    // try {
    //   await fs.access(`./storage/${filePath}`);
    // } catch (err) {
    //   console.log('Access Error: ' + err);
    //   return undefined;
    // }

    try {
      // delete 10 diff objects in the S3 bucket

      // await fs.unlink(`./storage/${filePath}`);
      /*const response = */ await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: filePath,
        }),
      );
    } catch (err) {
      console.log('Delete Error: ' + err);
      return undefined;
    }
    return markdownFileDTO;
  }

  ///===----------------------------------------------------

  async createFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    const markdownID = CryptoJS.SHA256(
      markdownFileDTO.UserID.toString() +
        new Date().getTime().toString(),
    ).toString();
    markdownFileDTO.MarkdownID = markdownID;

    const filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;

    // try {
    //   await fs.mkdir(`./storage/${filePath}`, {
    //     recursive: true,
    //   });
    // } catch (err) {
    //   console.log(
    //     'Directory Creation Error: ' + err,
    //   );
    //   return undefined;
    // }

    try {
      // await fs.writeFile(
      //   `./storage/${filePath}/${markdownFileDTO.MarkdownID}`,
      //   '',
      //   'utf-8',
      // );
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: filePath,
          Body: new Uint8Array(Buffer.from('')),
        }),
      );
    } catch (err) {
      console.log(
        'S3 content file creation error: ' + err,
      );
      return undefined;
    }

    markdownFileDTO.Content = '';
    markdownFileDTO.Size = 0;
    return markdownFileDTO;
  }

  ///===----------------------------------------------------

  async saveFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    const filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;

    // try {
    //   await fs.access(`./storage/${filePath}`);
    // } catch (err) {
    //   console.log('Access Error: ' + err);
    //   return undefined;
    // }

    const fileData = new Uint8Array(
      Buffer.from(markdownFileDTO.Content),
    );

    try {
      // Save the diff object in the S3 bucket
      // at key: `${UserID}/${MarkdownID}/diff/{NextDiffID}`

      // await fs.writeFile(
      //   `./storage/${filePath}`,
      //   fileData,
      //   'utf-8',
      // );
      /*const response = */ await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: filePath,
          Body: fileData,
        }),
      );
    } catch (err) {
      console.log('Write File Error: ' + err);
      return undefined;
    }

    // try {
    //   // await fs.writeFile(
    //   //   `./storage/${filePath}/diff/${markdownFileDTO.NextDiffID}`,
    //   //   fileData,
    //   //   'utf-8',
    //   // );
    //   /*const response = */ await this.s3Client.send(
    //     new PutObjectCommand({
    //       Bucket: this.awsS3BucketName,
    //       Key: `${filePath}/diff/${markdownFileDTO.NextDiffID}`,
    //       Body: markdownFileDTO.NewDiff,
    //     }),
    //   );
    // } catch (err) {}

    return markdownFileDTO;
  }

  ///===----------------------------------------------------

  async retrieveFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    console.log('Retrieve File (s3)');
    const filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;

    // try {
    //   await fs.access(`./storage/${filePath}`);
    // } catch (err) {
    //   console.log('Access Error: ' + err);
    //   return undefined;
    // }

    try {
      // markdownFileDTO.Content = await fs.readFile(
      //   `./storage/${filePath}`,
      //   {
      //     encoding: 'utf-8',
      //   },
      // );
      // markdownFileDTO.Size =
      //   markdownFileDTO.Content.length;

      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: filePath,
        }),
      );

      markdownFileDTO.Content =
        await response.Body.transformToString();
      markdownFileDTO.Size =
        response.ContentLength;
    } catch (err) {
      console.log('Read File Error: ' + err);
      return undefined;
    }

    return markdownFileDTO;
  }

  ///===----------------------------------------------------

  async createDiff(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    const filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: `${filePath}/diff/${markdownFileDTO.NextDiffIndex}`,
          Body: new Uint8Array(Buffer.from('')),
        }),
      );
    } catch (err) {
      console.log(
        'S3 diff object creation error: ' + err,
      );
      return undefined;
    }
  }

  async createDiffObjectsForFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    const filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;
    for (
      let i = 0;
      i < parseInt(process.env.MAX_DIFFS);
      i++
    ) {
      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.awsS3BucketName,
            Key: `${filePath}/diff/${i}`,
            Body: new Uint8Array(Buffer.from('')),
          }),
        );
      } catch (err) {
        console.log(
          `S3 diff ${i} object creation error: ` +
            err,
        );
        return undefined;
      }
    }
  }

  ///===----------------------------------------------------

  async saveDiff(
    diffDTO: DiffDTO,
    nextDiffID: number,
  ) {
    const filePath = `${diffDTO.UserID}/${diffDTO.MarkdownID}`;

    console.log(
      'diffDTO.Content: ',
      diffDTO.Content,
    );
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: `${filePath}/diff/${nextDiffID}`,
          Body: diffDTO.Content,
        }),
      );
    } catch (err) {
      console.log('Write File Error: ' + err);
      return undefined;
    }
    return diffDTO;
  }

  ///===----------------------------------------------------

  async getDiffSet(
    S3DiffIDs: number[],
    userID: number,
    markdownID: string,
  ) {
    const filePath = `${userID}/${markdownID}`;

    const diffDTOs: DiffDTO[] = [];

    for (let i = 0; i < S3DiffIDs.length; i++) {
      try {
        const response = await this.s3Client.send(
          new GetObjectCommand({
            Bucket: this.awsS3BucketName,
            Key: `${filePath}/diff/${S3DiffIDs[i]}`,
          }),
        );

        const diffDTO = new DiffDTO();
        diffDTO.Content =
          await response.Body.transformToString();
        diffDTO.S3DiffIndex = S3DiffIDs[i];
        diffDTOs.push(diffDTO);
      } catch (err) {
        console.log(
          `S3 diff ${i} read error: ` + err,
        );
        return undefined;
      }
    }
    return diffDTOs;
  }

  ///===----------------------------------------------------

  async getSnapshot(
    S3SnapshotID: number,
    userID: number,
    markdownID: string,
  ) {
    const filePath = `${userID}/${markdownID}`;

    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: `${filePath}/snapshot/${S3SnapshotID}`,
        }),
      );

      const snapshotDTO = new SnapshotDTO();
      snapshotDTO.Content =
        await response.Body.transformToString();
      return snapshotDTO;
    } catch (err) {
      console.log(
        `S3 snapshot ${S3SnapshotID} read error: ` +
          err,
      );
      return undefined;
    }
  }

  ///===----------------------------------------------------

  async saveOldestSnapshot(diffDTO: DiffDTO) {
    const filePath = `${diffDTO.UserID}/${diffDTO.MarkdownID}`;

    const markdownFileDTO = new MarkdownFileDTO();
    markdownFileDTO.UserID = diffDTO.UserID;
    markdownFileDTO.MarkdownID =
      diffDTO.MarkdownID;

    const file = await this.retrieveFile(
      markdownFileDTO,
    );

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: `${filePath}/snapshot/${process.env.MAX_SNAPSHOTS}`,
          Body: file.Content,
        }),
      );
    } catch (err) {
      console.log('Write File Error: ' + err);
      return undefined;
    }
    return diffDTO;
  }

  ///===----------------------------------------------------

  async retrieveOldestSnapshot(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    const filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;

    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: `${filePath}/snapshot/${process.env.MAX_SNAPSHOTS}`,
        }),
      );

      markdownFileDTO.Content =
        await response.Body.transformToString();
      markdownFileDTO.Size =
        response.ContentLength;
    } catch (err) {
      console.log('Read File Error: ' + err);
      return undefined;
    }
  }

  ///===----------------------------------------------------

  /**
   * @notes every snapshot is associated with n previous diffs.
   * The IDs of the associated diffs do not change unless
   * a change is made to the relevant versioning env variables.
   */

  async getAllDiffsForSnapshot(
    snapshotDTO: SnapshotDTO,
  ) {
    const filePath = `${snapshotDTO.UserID}/${snapshotDTO.MarkdownID}`;

    const diffDTOs: DiffDTO[] = [];

    const firstDiffID =
      snapshotDTO.S3SnapshotIndex *
      parseInt(process.env.DIFFS_PER_SNAPSHOT);

    for (
      let j = firstDiffID;
      j <
      firstDiffID +
        parseInt(process.env.DIFFS_PER_SNAPSHOT);
      j++
    ) {
      try {
        const response = await this.s3Client.send(
          new GetObjectCommand({
            Bucket: this.awsS3BucketName,
            Key: `${filePath}/diff/${j}`,
          }),
        );

        const diffDTO = new DiffDTO();
        diffDTO.Content =
          await response.Body.transformToString();
        diffDTOs.push(diffDTO);
      } catch (err) {
        console.log(
          `S3 diff ${j} read error: ` + err,
        );
        return undefined;
      }
    }
    return diffDTOs;
  }

  ///===----------------------------------------------------

  async deleteDiffObjectsForFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    const filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;
    for (
      let i = 0;
      i < parseInt(process.env.MAX_DIFFS);
      i++
    ) {
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.awsS3BucketName,
            Key: `${filePath}/diff/${i}`,
          }),
        );
      } catch (err) {
        console.log(
          'Delete all diffs error: ' + err,
        );
        return undefined;
      }
    }
  }

  ///===----------------------------------------------------

  async createSnapshot(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    const filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: `${filePath}/snapshot/${markdownFileDTO.NextSnapshotIndex}`,
          Body: new Uint8Array(Buffer.from('')),
        }),
      );
    } catch (err) {
      console.log(
        'S3 snapshot object creation error: ' +
          err,
      );
      return undefined;
    }
  }

  ///===----------------------------------------------------

  async createSnapshotObjectsForFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    const filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;

    // Create snapshot objects
    for (
      let j = 0;
      j < parseInt(process.env.MAX_SNAPSHOTS);
      j++
    ) {
      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.awsS3BucketName,
            Key: `${filePath}/snapshot/${j}`,
            Body: new Uint8Array(Buffer.from('')),
          }),
        );
      } catch (err) {
        console.log(
          `S3 snapshot ${j} object creation error`,
        );
        return undefined;
      }
    }
  }

  ///===----------------------------------------------------

  async deleteSnapshotObjectsForFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    const filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;
    for (
      let i = 0;
      i < parseInt(process.env.MAX_SNAPSHOTS);
      i++
    ) {
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.awsS3BucketName,
            Key: `${filePath}/snapshot/${i}`,
          }),
        );
      } catch (err) {
        console.log(
          'Delete all snapshots error: ' + err,
        );
        return undefined;
      }
    }
  }

  ///===----------------------------------------------------

  async saveSnapshot(
    diffDTO: DiffDTO,
    nextSnapshotID: number,
  ) {
    const markdownFileDTO: MarkdownFileDTO =
      new MarkdownFileDTO();
    markdownFileDTO.UserID = diffDTO.UserID;
    markdownFileDTO.MarkdownID =
      diffDTO.MarkdownID;
    const fileDTO = await this.retrieveFile(
      markdownFileDTO,
    );

    const filePath = `${diffDTO.UserID}/${diffDTO.MarkdownID}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: `${filePath}/snapshot/${nextSnapshotID}`,
          Body: fileDTO.Content,
        }),
      );
    } catch (err) {
      console.log('Write File Error: ' + err);
      return undefined;
    }

    return diffDTO;
  }

  ///===----------------------------------------------------
  async backupSnapshot(
    diffDTO: DiffDTO,
    nextSnapshotID: number,
  ) {
    const markdownFileDTO: MarkdownFileDTO =
      new MarkdownFileDTO();
    markdownFileDTO.UserID = diffDTO.UserID;
    markdownFileDTO.MarkdownID =
      diffDTO.MarkdownID;
    const fileDTO = await this.getSnapshot(
      nextSnapshotID,
      markdownFileDTO.UserID,
      markdownFileDTO.MarkdownID,
    );

    const filePath = `${diffDTO.UserID}/${diffDTO.MarkdownID}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: `${filePath}/snapshot/-1`,
          Body: fileDTO.Content,
        }),
      );
    } catch (err) {
      console.log('Write File Error: ' + err);
      return undefined;
    }

    return diffDTO;
  }

  ///===----------------------------------------------------

  async retrieveAllSnapshots(
    logicalOrder: number[],
    snapshotDTO: SnapshotDTO,
  ) {
    const filePath = `${snapshotDTO.UserID}/${snapshotDTO.MarkdownID}`;

    const snapshotDTOs: SnapshotDTO[] = [];

    for (
      let i = 0;
      i < logicalOrder.length;
      i++
    ) {
      console.log(
        'Trying to retrieve snapshot on path ',
        `${filePath}/snapshot/${logicalOrder[i]}`,
      );
      try {
        const response = await this.s3Client.send(
          new GetObjectCommand({
            Bucket: this.awsS3BucketName,
            Key: `${filePath}/snapshot/${logicalOrder[i]}`,
          }),
        );

        const snapshotDTO = new SnapshotDTO();
        snapshotDTO.Content =
          await response.Body.transformToString();
        snapshotDTOs.push(snapshotDTO);
      } catch (err) {
        console.log(
          `S3 snapshot ${i} read error: ` + err,
        );
        return undefined;
      }
    }
    return snapshotDTOs;
  }

  ///===----------------------------------------------------

  async createAsset(assetDTO: AssetDTO) {
    // Generate new AssetID
    const newAssetDTO = new AssetDTO();
    newAssetDTO.AssetID = CryptoJS.SHA256(
      assetDTO.UserID.toString() +
        new Date().getTime().toString(),
    ).toString();

    const filePath = `${assetDTO.UserID}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: `${filePath}/${newAssetDTO.AssetID}`,
          Body: new Uint8Array(Buffer.from('')),
        }),
      );
    } catch (err) {
      console.log('Write File Error:' + err);
      return undefined;
    }

    newAssetDTO.Content = '';
    newAssetDTO.DateCreated = new Date();
    newAssetDTO.Size = 0;
    return newAssetDTO;
  }

  ///===----------------------------------------------------

  async saveTextractResponse(
    saveAssetDTO: AssetDTO,
    textractResponse: any,
  ) {
    let filePath = `${saveAssetDTO.UserID}`;

    // try {
    //   await fs.mkdir(`./storage/${filePath}`, {
    //     recursive: true,
    //   });
    // } catch (err) {
    //   // console.log(
    //   //   'Directory Creation Error: ' + err,
    //   // );
    //   return undefined;
    // }

    const fileData = JSON.stringify(
      textractResponse,
    );

    filePath += `/${saveAssetDTO.TextID}`;

    try {
      // await fs.writeFile(
      //   `./storage/${filePath}`,
      //   fileData,
      //   'utf-8',
      // );

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: filePath,
          Body: fileData,
        }),
      );
    } catch (err) {
      console.log('Write File Error: ' + err);
      return undefined;
    }
    saveAssetDTO.DateCreated = new Date();
    saveAssetDTO.Size =
      saveAssetDTO.Content.length;
    saveAssetDTO.Content = '';
    return saveAssetDTO;
  }

  ///===----------------------------------------------------

  async saveImageAsset(saveAssetDTO: AssetDTO) {
    let filePath = `${saveAssetDTO.UserID}`;

    // try {
    //   await fs.mkdir(`./storage/${filePath}`, {
    //     recursive: true,
    //   });
    // } catch (err) {
    //   // console.log(
    //   //   'Directory Creation Error: ' + err,
    //   // );
    //   return undefined;
    // }

    const fileData = new Uint8Array(
      Buffer.from(saveAssetDTO.Content),
    );

    filePath += `/${saveAssetDTO.AssetID}`;

    try {
      // await fs.writeFile(
      //   `./storage/${filePath}`,
      //   fileData,
      //   'utf-8',
      // );

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: filePath,
          Body: fileData,
        }),
      );
    } catch (err) {
      console.log('Write File Error: ' + err);
      return undefined;
    }

    saveAssetDTO.DateCreated = new Date();
    saveAssetDTO.Size =
      saveAssetDTO.Content.length;
    saveAssetDTO.Content = '';
    return saveAssetDTO;
  }

  ///===----------------------------------------------------

  async saveTextAssetImage(
    saveAssetDTO: AssetDTO,
  ) {
    let filePath = `${saveAssetDTO.UserID}`;

    // try {
    //   await fs.mkdir(`./storage/${filePath}`, {
    //     recursive: true,
    //   });
    // } catch (err) {
    //   console.log(
    //     'Directory Creation Error: ' + err,
    //   );
    //   return undefined;
    // }

    const fileData = new Uint8Array(
      saveAssetDTO.ImageBuffer,
    );

    filePath += `/${saveAssetDTO.AssetID}`;

    try {
      // await fs.writeFile(
      //   `./storage/${filePath}`,
      //   fileData,
      //   'utf-8',
      // );

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: filePath,
          Body: fileData,
        }),
      );
    } catch (err) {
      console.log('Write File Error: ' + err);
      return undefined;
    }

    saveAssetDTO.DateCreated = new Date();
    saveAssetDTO.Size =
      saveAssetDTO.Content.length;
    saveAssetDTO.Content = '';
    return saveAssetDTO;
  }

  ///===----------------------------------------------------

  async retrieveAssetByID(
    assetID: string,
    userID: number,
    type: string,
  ) {
    let response;
    let filePath = `${userID}`;

    // console.log('S3.retrieveAssetByID', assetID);

    // try {
    //   await fs.access(`./storage/${filePath}`);
    // } catch (err) {
    //   console.log('Access Error: ' + err);
    //   return undefined;
    // }

    filePath += `/${assetID}`;

    try {
      // retrieveAssetDTO.Content =
      //   await fs.readFile(
      //     `./storage/${filePath}`,
      //     {
      //       encoding: 'utf-8',
      //     },
      //   );
      // retrieveAssetDTO.Size =
      //   retrieveAssetDTO.Content.length;

      response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: filePath,
        }),
      );
    } catch (err) {
      console.log(
        'retrieveAssetByID Read File Error: ' +
          err,
      );
      return undefined;
    }
    if (type === 'textractResponse') {
      return await response.Body.transformToString();
    } else if (type === 'image') {
      let temp =
        await response.Body.transformToByteArray();
      temp = Buffer.from(temp);
      return temp;
    }
  }

  ///===----------------------------------------------------

  async retrieveAsset(
    retrieveAssetDTO: AssetDTO,
  ) {
    console.log('Retrieve Asset (s3)');
    let filePath = `${retrieveAssetDTO.UserID}`;

    // try {
    //   await fs.access(`./storage/${filePath}`);
    // } catch (err) {
    //   console.log('Access Error: ' + err);
    //   return undefined;
    // }

    filePath += `/${retrieveAssetDTO.AssetID}`;

    try {
      // retrieveAssetDTO.Content =
      //   await fs.readFile(
      //     `./storage/${filePath}`,
      //     {
      //       encoding: 'utf-8',
      //     },
      //   );
      // retrieveAssetDTO.Size =
      //   retrieveAssetDTO.Content.length;

      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: filePath,
        }),
      );

      retrieveAssetDTO.Content =
        await response.Body.transformToString();
      retrieveAssetDTO.Size =
        retrieveAssetDTO.Content.length;
    } catch (err) {
      console.log(
        'retriveAsset Read File Error: ' + err,
      );
      return undefined;
    }

    return retrieveAssetDTO;
  }

  ///===----------------------------------------------------

  async deleteAsset(assetDTO: AssetDTO) {
    console.log('Delete Asset (s3)');
    let filePath = `${assetDTO.UserID}`;

    // try {
    //   await fs.access(`./storage/${filePath}`);
    // } catch (err) {
    //   console.log('Access Error: ' + err);
    //   return undefined;
    // }

    filePath += `/${assetDTO.AssetID}`;

    try {
      // await fs.unlink(`./storage/${filePath}`);
      /*const response = */ await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: filePath,
        }),
      );
    } catch (err) {
      console.log('Delete Error: ' + err);
      return undefined;
    }
    return assetDTO;
  }
}
