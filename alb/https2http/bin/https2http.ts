#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Https2HttpStack, Https2HttpStackProps } from '../lib/https2http-stack';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as dotenv from 'dotenv'
dotenv.config()

if(typeof process.env.ACM_CERT_ARN === "undefined") {
  throw new Error("ACM_CERT_ARN is not defined");
}
if(typeof process.env.ROUTE53_ROOT_DOMAIN === "undefined") {
  throw new Error("ROUTE53_ROOT_DOMAIN is not defined");
}
export const config: Https2HttpStackProps = {
  vpcCidr: "10.0.0.0/16",
  linuxInstanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
  acmCertArn: process.env.ACM_CERT_ARN!,
  rootDomain: process.env.ROUTE53_ROOT_DOMAIN!,
  prefixDomain: "test3450",
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
}

const app = new cdk.App();
new Https2HttpStack(app, 'Https2HttpStack', config);