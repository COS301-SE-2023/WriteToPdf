import { App, CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  PolicyStatement,
  Role,
  ServicePrincipal,
  User,
} from "aws-cdk-lib/aws-iam";
import { Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";
import { Topic } from "aws-cdk-lib/aws-sns";
import { Alias } from "aws-cdk-lib/aws-kms";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Queue } from "aws-cdk-lib/aws-sqs";

export class S3Stack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    let textract = new ServicePrincipal("textract.amazonaws.com");

    // Create S3 bucket to hold user assets
    const bucket = new Bucket(this, "WriteToPDFAppBucket", {
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      // blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
    });
    bucket.grantReadWrite(textract);

    let queue = new Queue(this, "writetopdf-textract-queue", {});

    let topic = new Topic(this, "writetopdf-textract-topic", {
      masterKey: Alias.fromAliasName(this, "defaultKey", "alias/aws/sns"),
    });
    topic.addSubscription(new SqsSubscription(queue));

    let role = new Role(this, "writetopdf-textract-role", {
      assumedBy: textract,
    });
    topic.grantPublish(role);

    const user = new User(this, "MyIAMUser", {
      userName: "writetopdf-webapp-prod",
    });

    const policy = new PolicyStatement({
      actions: [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "textract:*",
      ],
      resources: ["*"],
    });

    user.addToPolicy(policy);

    new CfnOutput(this, "TopicArn", { value: topic.topicArn });

    new CfnOutput(this, "RoleArn", { value: role.roleArn });

    new CfnOutput(this, "QueueUrl", { value: queue.queueUrl });

    new CfnOutput(this, "S3BucketName", {
      value: bucket.bucketName,
    });

    new CfnOutput(this, "S3BucketRegion", {
      value: bucket.bucketRegionalDomainName,
    });
  }
}
