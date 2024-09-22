import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs'

export interface Ec2StackProps extends cdk.StackProps {
  readonly vpcCidr: string;
  readonly linuxInstanceType: cdk.aws_ec2.InstanceType,
  readonly containerRegistry: string,
}

export class Ec2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Ec2StackProps) {
    super(scope, id, props);
    const vpc = new ec2.Vpc(this, "Vpc", {
      ipAddresses: ec2.IpAddresses.cidr(props.vpcCidr),
    });

    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc: vpc
    })

    cluster.addCapacity("Capacity", {
      minCapacity: 2, // default: 1
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
    })

    const taskDef = new ecs.Ec2TaskDefinition(this, "MyTaskDef");
    // worker
    taskDef.addContainer("Container", {
      image: ecs.ContainerImage.fromRegistry(props.containerRegistry),
      // ECS Container Container must have at least one of 'memoryLimitMiB' or 'memoryReservationMiB' specified
      memoryLimitMiB: 256,
      // default: Containers use the same logging driver that the Docker daemon uses.
      logging: new ecs.AwsLogDriver({streamPrefix: "Container"}),
      // default: No environment variables.
    })

    const service = new ecs.Ec2Service(this, "Service", {
      cluster: cluster,
      taskDefinition: taskDef,
    })
  }
}
