#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PrivateStack, PrivateStackProps } from '../lib/private-stack';
import * as ec2 from "aws-cdk-lib/aws-ec2";

export const config: PrivateStackProps = {
  vpcCidr: "10.0.0.0/16",
  linuxInstanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
}

const app = new cdk.App();
new PrivateStack(app, 'PrivateStack', config);