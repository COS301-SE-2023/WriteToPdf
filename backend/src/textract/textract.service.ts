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
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

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
      region: this.awsS3BucketRegion,
    });

  private readonly sqsClient = new SQSClient({
    credentials: {
      accessKeyId: this.awsS3AccessKeyId,
      secretAccessKey: this.awsS3SecretAccessKey,
    },
    region: this.awsS3BucketRegion,
  });

  extraction = null;

  // async _extractDocumentAsynchronous(
  //   markdownFileDTO: MarkdownFileDTO,
  //   extractType: string,
  // ) {
  //   console.log(markdownFileDTO);
  //   let textCommand: StartDocumentTextDetectionCommand;
  //   let tableCommand: StartDocumentAnalysisCommand;
  //   if (extractType === 'text') {
  //     textCommand =
  //       new StartDocumentTextDetectionCommand({
  //         DocumentLocation: {
  //           S3Object: {
  //             Bucket: this.awsS3BucketName,
  //             Name: markdownFileDTO.MarkdownID,
  //           },
  //         },
  //         NotificationChannel: {
  //           SNSTopicArn: this.snsTopicArn,
  //           RoleArn: this.roleArn,
  //         },
  //       });
  //   } else {
  //     tableCommand =
  //       new StartDocumentAnalysisCommand({
  //         DocumentLocation: {
  //           S3Object: {
  //             Bucket: this.awsS3BucketName,
  //             Name: markdownFileDTO.MarkdownID,
  //           },
  //         },
  //         NotificationChannel: {
  //           SNSTopicArn: this.snsTopicArn,
  //           RoleArn: this.roleArn,
  //         },
  //         FeatureTypes: [FeatureType.TABLES],
  //       });
  //   }

  //   const { JobId: jobId } =
  //     await this.textractClient.send(
  //       extractType === 'text'
  //         ? textCommand
  //         : tableCommand,
  //     );
  //   console.log(`JobId: ${jobId}`);

  //   let waitTime = 0;
  //   const getJob = async (jobId) => {
  //     const { Messages } =
  //       await this.sqsClient.send(
  //         new ReceiveMessageCommand({
  //           QueueUrl: this.queueUrl,
  //           MaxNumberOfMessages: 1,
  //         }),
  //       );
  //     if (Messages) {
  //       console.log(
  //         `Message[0]: ${Messages[0].Body}`,
  //       );
  //       await this.sqsClient.send(
  //         new DeleteMessageCommand({
  //           QueueUrl: this.queueUrl,
  //           ReceiptHandle:
  //             Messages[0].ReceiptHandle,
  //         }),
  //       );
  //       if (
  //         JSON.parse(
  //           JSON.parse(Messages[0].Body).Message,
  //         ).Status === JobStatus.SUCCEEDED
  //       ) {
  //         let getTextCommand: GetDocumentTextDetectionCommand;
  //         let getTableCommand: GetDocumentAnalysisCommand;
  //         if (extractType === 'text') {
  //           getTextCommand =
  //             new GetDocumentTextDetectionCommand(
  //               { JobId: jobId },
  //             );
  //         } else {
  //           getTableCommand =
  //             new GetDocumentAnalysisCommand({
  //               JobId: jobId,
  //             });
  //         }
  //         const { Blocks } =
  //           await this.textractClient.send(
  //             extractType === 'text'
  //               ? getTextCommand
  //               : getTableCommand,
  //           );
  //         this.extraction = {
  //           Name: markdownFileDTO.MarkdownID,
  //           ExtractType: extractType,
  //           Extracted: Blocks,
  //         };
  //         return this.extraction;
  //       }
  //     } else {
  //       const tick = 5000;
  //       waitTime += tick;
  //       console.log(
  //         `Waited ${
  //           waitTime / 1000
  //         } seconds. No messages yet.`,
  //       );
  //       setTimeout(getJob, tick);
  //     }
  //   };
  //   await getJob(jobId);
  // }

  async _extractDocumentSynchronous(
    markdownFileDTO: MarkdownFileDTO,
    extractType: string,
  ) {
    let textCommand: DetectDocumentTextCommand;
    let tableCommand: AnalyzeDocumentCommand;
    if (extractType === 'text') {
      textCommand = new DetectDocumentTextCommand(
        {
          Document: {
            S3Object: {
              Bucket:
                'writetopdfs3stack-writetopdfappbucketfc6d0172-1rmwa22kdzix8',
              // Bucket: this.awsS3BucketName,
              Name: 'IMG_3601.jpeg',
              // Name: markdownFileDTO.MarkdownID,
            },
          },
        },
      );
    } else {
      tableCommand = new AnalyzeDocumentCommand({
        Document: {
          S3Object: {
            Bucket:
              'writetopdfs3stack-writetopdfappbucketfc6d0172-1rmwa22kdzix8',
            // Bucket: this.awsS3BucketName,
            Name: 'IMG_3601.jpeg',
            // Name: markdownFileDTO.MarkdownID,
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
      Name: markdownFileDTO.MarkdownID,
      ExtractType: extractType,
      Children: textractResponse,
    };
    console.log(textractResponse['Blocks']);

    return textractResponse;
  }
}
