import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as autoscaling from "aws-cdk-lib/aws-autoscaling"
import { readFileSync } from "fs";


export interface HttpAutoScalingStackProps extends cdk.StackProps {
  readonly vpcCidr: string;
  readonly linuxInstanceType: ec2.InstanceType;
}

export class HttpAutoScalingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: HttpAutoScalingStackProps) {
    super(scope, id, props);
    
    const vpc = new ec2.Vpc(this, "Vpc", {
      ipAddresses: ec2.IpAddresses.cidr(props.vpcCidr),
    });

    const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc,
      instanceType: props.linuxInstanceType,
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
    });

    asg.addUserData(
      readFileSync("./lib/resources/startup.sh", "utf-8")
    );

    const alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true
    });
    const targetPort = 80
    const listener = alb.addListener('Listener', {
      port: 80,
    });
    const tg = listener.addTargets('Targets', {
      port: targetPort,
      // AutoScalingGroup impl IApplicationLoadBalancerTarget
      targets: [asg]
    });

    asg.connections.allowFrom(asg, ec2.Port.tcp(targetPort))

    new cdk.CfnOutput(this, "ALBUrl", {
      value: `http://${alb.loadBalancerDnsName}`
    })
  }
}