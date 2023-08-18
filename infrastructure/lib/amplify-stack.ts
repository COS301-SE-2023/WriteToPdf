import {
  GitHubSourceCodeProvider,
  App as Amp_App,
} from "@aws-cdk/aws-amplify-alpha";
import { App, CfnOutput, SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { BuildSpec } from "aws-cdk-lib/aws-codebuild";

export class AmplifyStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // ========================== AMPLIFY FRONTEND ==========================

    const sourceCodeProvider = new GitHubSourceCodeProvider({
      // oauthToken: cdk.SecretValue.secretsManager("GITHUB_TOKEN"),
      oauthToken: SecretValue.unsafePlainText(
        "" // Remove
      ),
      owner: "COS301-SE-2023",
      repository: "WriteToPdf",
    });

    const environmentVariables = {
      AMPLIFY_MONOREPO_APP_ROOT: "frontend",
      WRITETOPDF_API: "", // Add in using Amplify console/find way to obfuscate
    };

    const buildSpec = BuildSpec.fromObjectToYaml({
      version: "1.0",
      applications: [
        {
          appRoot: "frontend",
          frontend: {
            phases: {
              preBuild: {
                commands: [
                  // Fix envirmonment vars
                  "npm ci",
                  "echo \"export const environment = { production: false,apiURL:'http://$WRITETOPDF_API:3000/',DEV_USER_EMAIL:'secret',DEV_USER_PASSWORD:'secret',};\" >> src/environments/environment.staging.ts",
                ],
              },
              build: {
                commands: ["npm run prod"],
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

    const amplifyFrontend = new Amp_App(this, "WriteToPDFAmplify", {
      sourceCodeProvider,
      environmentVariables,
      buildSpec,
    });

    const mainBranch = amplifyFrontend.addBranch("main", {
      autoBuild: true,
    });

    const testBranch = amplifyFrontend.addBranch("test", {
      autoBuild: true,
    });
  }
}
