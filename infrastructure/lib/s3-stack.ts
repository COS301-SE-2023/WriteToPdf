import { App, CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { PolicyStatement, User } from "aws-cdk-lib/aws-iam";
import { Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";

export class S3Stack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create S3 bucket to hold user assets
    const bucket = new Bucket(this, "WriteToPDFAppBucket", {
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      // blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
    });

    const user = new User(this, "MyIAMUser", {
      userName: "writetopdf-webapp-test",
    });

    const policy = new PolicyStatement({
      actions: ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      resources: [bucket.bucketArn + "/*"],
    });

    user.addToPolicy(policy);

    new CfnOutput(this, "S3BucketName", {
      value: bucket.bucketName,
    });

    new CfnOutput(this, "S3BucketRegion", {
      value: bucket.bucketRegionalDomainName,
    });
  }
}
