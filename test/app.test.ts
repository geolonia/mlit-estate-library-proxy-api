import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { ProxyApiStack } from '../lib/proxy-api-stack';

const synth = () => {
  const app = new cdk.App();
  const stack = new ProxyApiStack(app, 'TestStack', {
    env: { account: '123456789012', region: 'us-east-1' },
  });
  return Template.fromStack(stack);
};

describe('ProxyApiStack', () => {
  test('cache key includes all query strings', () => {
    const template = synth();

    // from/to などのクエリが違うリクエストが同じキャッシュを共有しないこと
    template.hasResourceProperties('AWS::CloudFront::CachePolicy', {
      CachePolicyConfig: Match.objectLike({
        ParametersInCacheKeyAndForwardedToOrigin: Match.objectLike({
          QueryStringsConfig: { QueryStringBehavior: 'all' },
        }),
      }),
    });

    const distribution = template.findResources('AWS::CloudFront::Distribution');
    const [config] = Object.values(distribution).map(
      (r: any) => r.Properties.DistributionConfig,
    );
    expect(config.DefaultCacheBehavior.CachePolicyId).toEqual({ Ref: expect.any(String) });
  });
});
