import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { generateOriginRequestHandler } from '../scripts/prepare-edge-code';

export class ProxyApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // SSM パラメータストアから API キーを取得
    const apiKey = ssm.StringParameter.valueFromLookup(this, '/reinfolib/api/key');

    // APIキーを埋め込む
    generateOriginRequestHandler(apiKey);

    // APIキーを追加
    const originRequestFn = new cloudfront.experimental.EdgeFunction(this, 'OriginRequestFn', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'edge-origin-request.handler',
      code: lambda.Code.fromAsset('lambda.bundle'),
    });
    
    // CORS ヘッダーを追加
    const corsResponseFn = new cloudfront.experimental.EdgeFunction(this, 'CorsFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'edge-cors-response.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    // ヘッダーは追加しない。クエリ文字列は全て転送する
    const originRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'FullQueryPolicy', {
      originRequestPolicyName: 'FullQueryPolicy',
      comment: 'Forward all query strings to origin',
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList('Ocp-Apim-Subscription-Key'),
    });
    
    // クエリ文字列 (from/to 等) をキャッシュキーに含める。TTL は CachingOptimized と同じ
    const cachePolicy = new cloudfront.CachePolicy(this, 'QueryStringCachePolicy', {
      comment: 'Include all query strings in the cache key',
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      minTtl: Duration.seconds(1),
      defaultTtl: Duration.days(1),
      maxTtl: Duration.days(365),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    const distribution = new cloudfront.Distribution(this, 'ProxyDistribution', {
      defaultBehavior: {
        origin: new origins.HttpOrigin('www.reinfolib.mlit.go.jp', {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
        }),
        cachePolicy,
        originRequestPolicy,
        edgeLambdas: [
          {
            functionVersion: originRequestFn.currentVersion,
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

    // CloudFront ドメイン名を出力
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'CloudFront ディストリビューションのドメイン名',
    });
  }
}
