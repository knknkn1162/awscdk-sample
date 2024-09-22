import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

export interface Ec2LbStackProps extends cdk.StackProps {
  readonly vpcCidr: string;
  readonly instanceType: cdk.aws_ec2.InstanceType,
  readonly containerRegistry: string,
}
// dynamic port mapping
const EPHEMERAL_PORT_RANGE = ec2.Port.tcpRange(32768, 65535);

export class Ec2LbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Ec2LbStackProps) {
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

    const ecsService = new ecs_patterns.ApplicationLoadBalancedEc2Service(this, "Ec2Service", {
      cluster,
      memoryLimitMiB: 256,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry(props.containerRegistry),
      }
    });
    // when container.addPortMappings.hostPort is not set
    // you can omit the hostPort (or set it to 0) while specifying a containerPort
    // and your container automatically receives a port in the ephemeral port range
    // this can be ommited
    // ecsService.service.connections.allowFrom(ecsService.service, EPHEMERAL_PORT_RANGE);

    new cdk.CfnOutput(this, "networkLoadBalancerURL", {
      value: `http://${ecsService.loadBalancer.loadBalancerDnsName}`,
    });
  }
}
