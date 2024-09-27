import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import * as s3n from "aws-cdk-lib/aws-s3-notifications"

export class S3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Bucket", {
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
    })

    const lambda = new nodejs.NodejsFunction(this, 'MyFunction', {
      entry: './lib/scripts/main.ts', // accepts .js, .jsx, .cjs, .mjs, .ts, .tsx, .cts and .mts files
    });

    bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(lambda), {
      prefix: "test"
    })
    // for s3.send(new HeadObjectCommand(params)) in lambda
    bucket.grantRead(lambda)
  }
}
