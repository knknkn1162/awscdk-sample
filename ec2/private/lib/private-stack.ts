import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { CfnOutput } from 'aws-cdk-lib';

export interface PrivateStackProps extends cdk.StackProps {
  readonly vpcCidr: string;
  readonly linuxInstanceType: cdk.aws_ec2.InstanceType,
}

export class PrivateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PrivateStackProps) {
    super(scope, id, props);
  
    const vpc = new ec2.Vpc(this, "Vpc", {
      ipAddresses: ec2.IpAddresses.cidr(props.vpcCidr),
    })

    const bastion = new ec2.BastionHostLinux(this, "BastionVm", {
      vpc: vpc
    })

    const linuxvm = new ec2.Instance(this, "LinuxVm", {
      vpc: vpc,
      instanceType: props.linuxInstanceType,
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      // newly create every time
      keyPair: new ec2.KeyPair(this, "keyPair")
    })

    linuxvm.connections.allowFrom(bastion, ec2.Port.SSH)

    new CfnOutput(this, "LinuxvmSSHCommand", {
      // get `priv.pem` in `Systems Manager`
      value: `ssh -i priv.pem ec2-user@${linuxvm.instancePrivateIp}`
    })
  }
}