import { Injectable } from '@nestjs/common';
import {
  TextractClient,
  FeatureType,
  StartDocumentTextDetectionCommand,
  StartDocumentAnalysisCommand,
  GetDocumentTextDetectionCommand,
  JobStatus,
  GetDocumentAnalysisCommand,
  AnalyzeDocumentCommand,
  DetectDocumentTextCommand,
} from '@aws-sdk/client-textract';
import 'dotenv/config';
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { AssetDTO } from 'src/assets/dto/asset.dto';

@Injectable()
export class TextractService {
  awsS3BucketName =
    process.env.AWS_S3_BUCKET_NAME;
  awsS3BucketRegion =
    process.env.AWS_S3_BUCKET_REGION;
  awsS3AccessKeyId =
    process.env.AWS_S3_ACCESS_KEY_ID;
  awsS3SecretAccessKey =
    process.env.AWS_S3_SECRET_ACCESS_KEY;
  awsTextractRegion = 'eu-central-1';
  snsTopicArn =
    process.env.AWS_TEXTRACT_SNS_TOPIC_ARN;
  roleArn = process.env.AWS_S3_TEXTRACT_ROLE_ARN;
  queueUrl =
    process.env.AWS_S3_TEXTRACT_QUEUE_URL;

  private readonly textractClient =
    new TextractClient({
      credentials: {
        accessKeyId: this.awsS3AccessKeyId,
        secretAccessKey:
          this.awsS3SecretAccessKey,
      },
      region: this.awsTextractRegion,
    });

  private readonly sqsClient = new SQSClient({
    credentials: {
      accessKeyId: this.awsS3AccessKeyId,
      secretAccessKey: this.awsS3SecretAccessKey,
    },
    region: this.awsS3BucketRegion,
  });

  extraction = null;

  async _extractDocumentAsynchronous(
    assetDTO: AssetDTO,
    extractType: string,
  ) {
    let textCommand: StartDocumentTextDetectionCommand;
    let tableCommand: StartDocumentAnalysisCommand;
    const filePath = `${assetDTO.UserID}/${assetDTO.AssetID}`;
    console.log(extractType);
    if (extractType === 'text') {
      textCommand =
        new StartDocumentTextDetectionCommand({
          DocumentLocation: {
            S3Object: {
              Bucket: this.awsS3BucketName,
              Name: filePath,
            },
          },
          NotificationChannel: {
            SNSTopicArn: this.snsTopicArn,
            RoleArn: this.roleArn,
          },
        });
    } else {
      tableCommand =
        new StartDocumentAnalysisCommand({
          DocumentLocation: {
            S3Object: {
              Bucket: this.awsS3BucketName,
              Name: filePath,
            },
          },
          NotificationChannel: {
            SNSTopicArn: this.snsTopicArn,
            RoleArn: this.roleArn,
          },
          FeatureTypes: [FeatureType.TABLES],
        });
    }

    const { JobId: jobId } =
      await this.textractClient.send(
        extractType === 'text'
          ? textCommand
          : tableCommand,
      );

    let waitTime = 0;
    const getJob = async (jobId: string) => {
      const { Messages } =
        await this.sqsClient.send(
          new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 1,
          }),
        );
      if (Messages) {
        // console.log(
        //   `Message[0]: ${Messages[0].Body}`,
        // );
        await this.sqsClient.send(
          new DeleteMessageCommand({
            QueueUrl: this.queueUrl,
            ReceiptHandle:
              Messages[0].ReceiptHandle,
          }),
        );
        if (
          JSON.parse(
            JSON.parse(Messages[0].Body).Message,
          ).Status === JobStatus.SUCCEEDED
        ) {
          let getTextCommand: GetDocumentTextDetectionCommand;
          let getTableCommand: GetDocumentAnalysisCommand;
          if (extractType === 'text') {
            getTextCommand =
              new GetDocumentTextDetectionCommand(
                { JobId: jobId },
              );
          } else {
            getTableCommand =
              new GetDocumentAnalysisCommand({
                JobId: jobId,
              });
          }
          const { Blocks } =
            await this.textractClient.send(
              extractType === 'text'
                ? getTextCommand
                : getTableCommand,
            );
          this.extraction = {
            Name: assetDTO.AssetID,
            ExtractType: extractType,
            Extracted: Blocks,
          };
        }
      } else {
        const tick = 5000;
        waitTime += tick;
        // console.log(
        //   `Waited ${
        //     waitTime / 1000
        //   } seconds. No messages yet.`,
        // );
        setTimeout(getJob, tick);
      }
    };
    await getJob(jobId);
    return this.extraction;
  }

  async _extractDocumentSynchronous(
    assetDTO: AssetDTO,
    extractType: string,
  ) {
    let textCommand: DetectDocumentTextCommand;
    let tableCommand: AnalyzeDocumentCommand;
    const filePath = `${assetDTO.UserID}/${assetDTO.AssetID}`;
    if (extractType === 'text') {
      textCommand = new DetectDocumentTextCommand(
        {
          Document: {
            S3Object: {
              Bucket: this.awsS3BucketName,
              Name: filePath,
            },
          },
        },
      );
    } else {
      tableCommand = new AnalyzeDocumentCommand({
        Document: {
          S3Object: {
            Bucket: this.awsS3BucketName,
            Name: filePath,
          },
        },
        FeatureTypes: [FeatureType.TABLES],
      });
    }

    const textractResponse =
      await this.textractClient.send(
        extractType === 'text'
          ? textCommand
          : tableCommand,
      );

    this.extraction = {
      Name: assetDTO.AssetID,
      ExtractType: extractType,
      // Children: this._make_page_hierarchy(
      //   textractResponse['Blocks'],
      // ),
      Children: textractResponse,
    };
    // console.log(
    //   'Textract response: ',
    //   textractResponse,
    // );
    return textractResponse;
  }

  // _add_children(block, block_dict) {
  //   const rels_list = block.Relationships || [];
  //   rels_list.forEach((rels) => {
  //     if (rels.Type === 'CHILD') {
  //       block['Children'] = [];
  //       rels.Ids.forEach((relId) => {
  //         const kid = block_dict[relId];
  //         block['Children'].push(kid);
  //         this._add_children(kid, block_dict);
  //       });
  //     }
  //   });
  // }

  // _make_page_hierarchy(blocks) {
  //   const block_dict = {};
  //   blocks.forEach(
  //     (block) => (block_dict[block.Id] = block),
  //   );

  //   const pages = [];
  //   blocks.forEach((block) => {
  //     if (block.BlockType === 'PAGE') {
  //       pages.push(block);
  //       this._add_children(block, block_dict);
  //     }
  //   });
  //   return pages;
  // }

  async extractDocument(
    syncType: string,
    assetDTO: AssetDTO,
    extractType: string,
  ) {
    let retVal;
    try {
      if (syncType === 'sync') {
        retVal =
          await this._extractDocumentSynchronous(
            assetDTO,
            extractType,
          );
      } else {
        retVal =
          await this._extractDocumentAsynchronous(
            assetDTO,
            extractType,
          );
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      // console.log('Finally');
      return retVal;
    }
  }
}
