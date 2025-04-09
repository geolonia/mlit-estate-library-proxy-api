#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ProxyApiStack } from '../lib/proxy-api-stack';

const app = new cdk.App();
new ProxyApiStack(app, 'ProxyApiStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
});
