import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

export interface FargateLbStackProps extends cdk.StackProps {
  readonly vpcCidr: string;
  readonly instanceType: cdk.aws_ec2.InstanceType,
  readonly containerRegistry: string,
}

export class FargateLbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FargateLbStackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'MyVpc', {
      ipAddresses: ec2.IpAddresses.cidr(props.vpcCidr),
    });

    const cluster = new ecs.Cluster(this, 'Ec2Cluster', {
      vpc: vpc
    });

    cluster.addCapacity('DefaultASG', {
      instanceType: props.instanceType
    });

    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "FargateService", {
      cluster: cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry(props.containerRegistry),
      }
    });
  }
}
