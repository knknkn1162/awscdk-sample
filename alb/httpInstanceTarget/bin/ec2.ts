#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Ec2Stack, Ec2StackProps } from '../lib/ec2-stack';
import * as ec2 from "aws-cdk-lib/aws-ec2";

export const config: Ec2StackProps = {
  vpcCidr: "10.0.0.0/16",
  linuxInstanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
}

const app = new cdk.App();
new Ec2Stack(app, 'Ec2Stack', config);