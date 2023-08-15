#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { S3Stack } from "../lib/s3-stack";
import { AmplifyStack } from "../lib/amplify-stack";
import { EC2Stack } from "../lib/ec2-stack";

const app = new App();

new S3Stack(app, "WriteToPDFS3Stack", {
  env: { region: "eu-north-1" },
  description: "Stack with resources needed to deploy WriteToPDF's S3 Bucket",
});

new AmplifyStack(app, "WriteToPDFAmplifyStack", {
  env: { region: "eu-north-1" },
  description:
    "Stack with resources needed to deploy WriteToPDF's Amplify Frontend",
});

new EC2Stack(app, "WriteToPDFEC2Stack", {
  env: { region: "eu-north-1" },
  description: "Stack with resources needed to deploy WriteToPDF's EC2 Backend",
});

app.synth();
