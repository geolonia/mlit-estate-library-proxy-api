// lambda/edge-options-response.ts

export const handler = async (event: any): Promise<any> => {
  const request = event.Records[0].cf.request;

  if (request.method === 'OPTIONS') {
    return {
      status: '200',
      statusDescription: 'OK',
      headers: {
        'access-control-allow-origin': [{ key: 'Access-Control-Allow-Origin', value: '*' }],
        'access-control-allow-methods': [{ key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' }],
        'access-control-allow-headers': [{ key: 'Access-Control-Allow-Headers', value: '*' }],
        'cache-control': [{ key: 'Cache-Control', value: 'max-age=86400' }],
      },
      body: '',
    };
  }

  // 通常リクエストはそのまま通す
  return request;
};
