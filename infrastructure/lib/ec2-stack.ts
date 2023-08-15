import { App, CfnOutput, Stack, StackProps, Tags } from "aws-cdk-lib";
import {
  Vpc,
  SubnetType,
  Peer,
  Port,
  AmazonLinuxGeneration,
  AmazonLinuxCpuType,
  Instance,
  SecurityGroup,
  AmazonLinuxImage,
  InstanceClass,
  InstanceSize,
  InstanceType,
  MachineImage,
  OperatingSystemType,
} from "aws-cdk-lib/aws-ec2";
import {
  ApplicationLoadBalancer,
  ApplicationTargetGroup,
  ListenerAction,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { InstanceTarget } from "aws-cdk-lib/aws-elasticloadbalancingv2-targets";
import { Role, ServicePrincipal, ManagedPolicy } from "aws-cdk-lib/aws-iam";
import { readFileSync } from "fs";

export class EC2Stack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // IAM
    // Policy for CodeDeploy bucket access
    // Role that will be attached to the EC2 instance so it can be
    // managed by AWS SSM
    const webServerRole = new Role(this, "ec2Role", {
      assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
    });

    // IAM policy attachment to allow access to
    webServerRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );

    webServerRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AmazonEC2RoleforAWSCodeDeploy"
      )
    );

    // VPC
    // This VPC has 3 public subnets, and that's it
    const vpc = new Vpc(this, "WriteToPDFVPC", {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "pub01",
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "pub02",
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "pub03",
          subnetType: SubnetType.PUBLIC,
        },
      ],
    });

    // Security Groups
    // This SG will only allow HTTP traffic to the Web server
    const webSg = new SecurityGroup(this, "WriteToPDFWebSecurityGroup", {
      vpc,
      description: "Allows Inbound HTTP traffic to the web server.",
      allowAllOutbound: true,
    });

    webSg.addIngressRule(Peer.anyIpv4(), Port.tcp(22));
    webSg.addIngressRule(Peer.anyIpv4(), Port.tcp(80));
    webSg.addIngressRule(Peer.anyIpv4(), Port.tcp(3000));

    // EC2 Instance
    // Get the latest AmazonLinux 2 AMI for the given region
    const ami = new AmazonLinuxImage({
      generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: AmazonLinuxCpuType.X86_64,
    });

    const ubuntu = MachineImage.fromSsmParameter(
      "/aws/service/canonical/ubuntu/server/focal/stable/current/amd64/hvm/ebs-gp2/ami-id",
      { os: OperatingSystemType.LINUX }
    );
    // The actual Web EC2 Instance for the web server
    const webServer = new Instance(this, "WriteToPDFWebServer", {
      vpc,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      machineImage: ubuntu,
      securityGroup: webSg,
      role: webServerRole,
    });

    // Create Application Load Balancer
    const loadBalancer = new ApplicationLoadBalancer(this, "writetopdf-alb", {
      vpc,
      securityGroup: webSg,
      internetFacing: true,
    });

    const albTargetGroup = new ApplicationTargetGroup(
      this,
      "writetopdf-api-targets",
      {
        port: 3000,
        targets: [new InstanceTarget(webServer, 3000)],
      }
    );

    const albListener = loadBalancer.addListener("writetopdf-alb-listener", {
      port: 80,
      defaultAction: ListenerAction.forward([albTargetGroup]),
    });

    // User data - used for bootstrapping
    const webSGUserData = readFileSync(
      "./assets/configure_ubuntu_writetopdf.sh",
      "utf-8"
    );
    webServer.addUserData(webSGUserData);
    // Tag the instance
    Tags.of(webServer).add("application-name", "writetopdf-api");
    Tags.of(webServer).add("stage", "prod");

    // Output the public IP address of the EC2 instance
    new CfnOutput(this, "API DNS Name", {
      value: loadBalancer.loadBalancerDnsName,
    });
  }
}
