import { Stack, StackProps } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { generateEdgeHandler } from '../scripts/prepare-edge-code'; // import 追加

export class ProxyApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const apiKey = ssm.StringParameter.valueFromLookup(this, '/reinfolib/api/key');

    // Lambdaコードを生成（プレースホルダを置換）
    generateEdgeHandler(apiKey);

    const edgeFunction = new cloudfront.experimental.EdgeFunction(this, 'RewriteFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'edge-handler.handler',
      code: lambda.Code.fromAsset('lambda.bundle'),
    });

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
  }
}
