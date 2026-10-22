import * as path from 'path';
import { generateOriginRequestHandler } from '../scripts/prepare-edge-code';

const makeEvent = (uri: string) => ({
  Records: [{ cf: { request: { method: 'GET', uri, querystring: '', headers: {} as Record<string, any> } } }],
});

describe('generateOriginRequestHandler', () => {
  test('embeds the key verbatim in the bundled handler', async () => {
    // $& や $1 が置換パターンとして解釈されず、引用符やバックスラッシュでコードが壊れないこと
    const apiKey = 'test-$&-$1-\'"\\-key';
    generateOriginRequestHandler(apiKey);

    const bundlePath = path.join(__dirname, '../lambda.bundle/edge-origin-request.js');
    delete require.cache[require.resolve(bundlePath)];
    const { handler } = require(bundlePath);

    const tile = await handler(makeEvent('/ex-api/external/XPT001/13/7276/3225.pbf'));
    expect(tile.headers['ocp-apim-subscription-key']).toEqual([
      { key: 'Ocp-Apim-Subscription-Key', value: apiKey },
    ]);

    const other = await handler(makeEvent('/ex-api/external/XIT002'));
    expect(other.status).toBe('403');
  });
});
