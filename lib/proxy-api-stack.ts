import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export class ProxyApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // SSM パラメータストアから API キーを取得（あらかじめ /reinfolib/api/key に API キーを登録しておく）
    const apiKey = ssm.StringParameter.valueFromLookup(this, '/reinfolib/api/key');

    // Lambda@Edge 用の関数を作成（EdgeFunction は必ず us-east-1 で作成）
    const edgeFunction = new cloudfront.experimental.EdgeFunction(this, 'RewriteFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'edge-handler.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        API_KEY: apiKey,
      },
    });

    // CloudFront ディストリビューションを作成
    const distribution = new cloudfront.Distribution(this, 'ProxyDistribution', {
      defaultBehavior: {
        origin: new origins.HttpOrigin('www.reinfolib.mlit.go.jp', {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
        }),
        edgeLambdas: [{
          functionVersion: edgeFunction.currentVersion,
          eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
        }],
      },
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'CloudFront ディストリビューションのドメイン名',
    });
  }
}
