import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import * as path from 'path';
import * as fs from 'fs';

// ① Lambda@Edge 用コードに API キーを埋め込む関数
function generateEdgeHandler(apiKey: string) {
  const templatePath = path.join(__dirname, '../lambda/edge-handler.template.ts');
  const outputPath = path.join(__dirname, '../lambda.bundle/edge-handler.ts');

  const template = fs.readFileSync(templatePath, 'utf8');
  const replaced = template.replace('__API_KEY__', apiKey);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, replaced);
}

export class ProxyApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ② SSM パラメータストアから API キーを取得
    const apiKey = ssm.StringParameter.valueFromLookup(this, '/reinfolib/api/key');

    // ③ Lambda@Edge コードを生成（テンプレート → 置換）
    generateEdgeHandler(apiKey);

    // ④ Lambda@Edge: URI 書き換え
    const edgeRequestFn = new cloudfront.experimental.EdgeFunction(this, 'RewriteFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'edge-handler.handler',
      code: lambda.Code.fromAsset('lambda.bundle'),
    });

    // ⑤ Lambda@Edge: OPTIONS リクエストに即時応答
    const optionsHandlerFn = new cloudfront.experimental.EdgeFunction(this, 'OptionsFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'edge-options-response.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    // ⑥ Lambda@Edge: 全レスポンスに CORS ヘッダーを追加
    const corsResponseFn = new cloudfront.experimental.EdgeFunction(this, 'CorsFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'edge-cors-response.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    // ⑦ CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'ProxyDistribution', {
      defaultBehavior: {
        origin: new origins.HttpOrigin('www.reinfolib.mlit.go.jp', {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
        }),
        edgeLambdas: [
          {
            functionVersion: edgeRequestFn.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
          },
          {
            functionVersion: optionsHandlerFn.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
          },
          {
            functionVersion: corsResponseFn.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_RESPONSE,
          },
          {
            functionVersion: corsResponseFn.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.ORIGIN_RESPONSE,
          }        
        ],
      },
    });

    // ⑧ CloudFront ドメイン名を出力
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'CloudFront ディストリビューションのドメイン名',
    });
  }
}
