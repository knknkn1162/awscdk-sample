import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import {Vpc} from "aws-cdk-lib/aws-ec2";
import {AmazonLinuxVm} from "../lib/constructs/linuxvm"
import * as targets from "aws-cdk-lib/aws-elasticloadbalancingv2-targets";
import * as s3 from "aws-cdk-lib/aws-s3"

export interface Ec2StackProps extends cdk.StackProps {
  readonly vpcCidr: string;
  readonly linuxInstanceType: cdk.aws_ec2.InstanceType,
}

export class Ec2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Ec2StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, "Vpc", {
      ipAddresses: ec2.IpAddresses.cidr(props.vpcCidr),
    });
    const vms = [...Array(2)].map((_, idx) =>
      new AmazonLinuxVm(this, `Server${idx}`, {
        vpc: vpc,
        instanceType: props.linuxInstanceType,
      })
    );


    const alb = new elbv2.ApplicationLoadBalancer(this, "Alb", {
      vpc: vpc,
      internetFacing: true,
    });
    alb.logAccessLogs(
      new s3.Bucket(this, "ALBAccessBucket")
    );
    const targetPort = 80;
    alb.addListener("Listener", {
      protocol: elbv2.ApplicationProtocol.HTTP,
    }).addTargets("Targets", {
      port: targetPort,
      targets: vms.map(
        (val) => new targets.InstanceTarget(val.instance, targetPort)
      ),
    });

    vms.map(val =>
      val.instance.connections.allowFrom(alb, ec2.Port.tcp(targetPort))
    )

    new cdk.CfnOutput(this, "ALBUrl", {
      value: `http://${alb.loadBalancerDnsName}`
    })
  }
}
