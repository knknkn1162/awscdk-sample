#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Ec2LbStack, Ec2LbStackProps } from '../lib/ec2_lb-stack';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


export const config: Ec2LbStackProps = {
  vpcCidr: "10.0.0.0/16",
  instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
  containerRegistry: "amazon/amazon-ecs-sample",
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
}
const app = new cdk.App();
new Ec2LbStack(app, 'Ec2LbStack', config);