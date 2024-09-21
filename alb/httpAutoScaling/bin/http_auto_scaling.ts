#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HttpAutoScalingStack, HttpAutoScalingStackProps } from '../lib/http_auto_scaling-stack';
import * as ec2 from "aws-cdk-lib/aws-ec2";

export const config: HttpAutoScalingStackProps = {
  vpcCidr: "10.0.0.0/16",
  linuxInstanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
}

const app = new cdk.App();
new HttpAutoScalingStack(app, 'HttpAutoScalingStack', config)