import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3Deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as amplify from "@aws-cdk/aws-amplify-alpha";
import { BuildSpec } from "aws-cdk-lib/aws-codebuild";
// import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';

export class WriteToPDFStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket to hold user assets
    const bucket = new s3.Bucket(this, "WriteToPDFAppBucket", {
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      // blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
    });

    const user = new iam.User(this, "MyIAMUser", {
      userName: "writetopdf-webapp-test",
    });

    const policy = new iam.PolicyStatement({
      actions: ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      resources: [bucket.bucketArn + "/*"],
    });

    user.addToPolicy(policy);

    const sourceCodeProvider = new amplify.GitHubSourceCodeProvider({
      // oauthToken: cdk.SecretValue.secretsManager("GITHUB_TOKEN"),
      oauthToken: cdk.SecretValue.unsafePlainText(""),
      owner: "COS301-SE-2023",
      repository: "WriteToPdf",
    });

    const environmentVariables = {
      AMPLIFY_MONOREPO_APP_ROOT: "frontend",
    };

    const buildSpec = BuildSpec.fromObjectToYaml({
      version: "1.0",
      applications: [
        {
          appRoot: "frontend",
          frontend: {
            phases: {
              preBuild: {
                commands: ["npm ci"],
              },
              build: {
                commands: ["npm run build"],
              },
            },
            artifacts: {
              baseDirectory: "dist/frontend",
              files: ["**/*"],
            },
            cache: {
              paths: ["node_modules/**/*"],
            },
          },
        },
      ],
    });

    const amplifyFrontend = new amplify.App(this, "WriteToPDFAmplify", {
      sourceCodeProvider,
      environmentVariables,
      buildSpec,
    });

    const testBranch = amplifyFrontend.addBranch("test", {
      autoBuild: true,
    });
  }
}
