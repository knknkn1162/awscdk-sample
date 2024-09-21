import { CfnOutput } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { readFileSync } from "fs";

// Construct props を定義
export interface WebServerInstanceProps {
  readonly vpc: ec2.IVpc,
  readonly instanceType: ec2.InstanceType
}

export class AmazonLinuxVm extends Construct {
  public readonly instance: ec2.Instance;
  constructor(scope: Construct, id: string, props: WebServerInstanceProps) {
    super(scope, id);

    const instance = new ec2.Instance(this, "Instance", {
      vpc: props.vpc,
      instanceType: props.instanceType,
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    })

    instance.addUserData(
      readFileSync("./lib/resources/startup.sh", "utf-8")
    );

    this.instance = instance
  }
}