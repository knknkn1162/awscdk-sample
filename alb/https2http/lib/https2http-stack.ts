import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as autoscaling from "aws-cdk-lib/aws-autoscaling"
import { readFileSync } from "fs";
import * as route53 from "aws-cdk-lib/aws-route53"
import * as route53_targets from "aws-cdk-lib/aws-route53-targets"


export interface Https2HttpStackProps extends cdk.StackProps {
  readonly vpcCidr: string;
  readonly linuxInstanceType: ec2.InstanceType;
  readonly acmCertArn: string;
  readonly rootDomain: string
  readonly prefixDomain: string;
}

export class Https2HttpStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Https2HttpStackProps) {
    super(scope, id, props);
    const domain = `${props.rootDomain}.${props.prefixDomain}`
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

    const listener = alb.addListener("Listener", {
      port: 443,
    })
    listener.addCertificates("Cert", [{
      certificateArn: props.acmCertArn
    }])

    const targetPort = 80
    const tg = listener.addTargets('Targets', {
      port: targetPort,
      // AutoScalingGroup impl IApplicationLoadBalancerTarget
      targets: [asg]
    });

    // const zone = route53.PublicHostedZone.fromPublicHostedZoneAttributes(this, "Zone", {
    //   hostedZoneId: props.hostedZoneId,
    //   zoneName: props.rootDomain
    // })
    // this is more simple than above
    const zone = route53.PublicHostedZone.fromLookup(this, "Zone", {
      domainName: props.rootDomain,
    });
    const arec = new route53.ARecord(this, "Arec", {
      target: route53.RecordTarget.fromAlias(new route53_targets.LoadBalancerTarget(alb)),
      zone: zone,
      recordName: props.prefixDomain,
    });
    new cdk.CfnOutput(this, "ALBUrl", {
      value: `https://${arec.domainName}`
    });
  }
}
