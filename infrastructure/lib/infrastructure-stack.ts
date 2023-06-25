import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
// import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket to hold webpage (frontend)
    const bucket = new s3.Bucket(this, "WriteToPDFAppBucket", {
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      // websiteIndexDocument: "index.html",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
    });

    // Deploy built frontend to the S3 bucket
    const src = new s3Deploy.BucketDeployment(this, "DeployWTPA", {
      // sources: [s3Deploy.Source.asset("../frontend/dist/frontend")],
      sources: [],
      destinationBucket: bucket,
    });

    // Create Cloudfront service to stand infront of S3 bucket
    const cf = new cloudfront.CloudFrontWebDistribution(
      this,
      "CDKWTPAStaticDistribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      }
    );
  }
}
