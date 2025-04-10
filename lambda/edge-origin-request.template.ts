export const handler = async (event: any): Promise<any> => {
  const request = event.Records[0].cf.request;

  // OPTIONSリクエストならプリフライト応答
  if (request.method === 'OPTIONS') {
    return {
      status: '200',
      statusDescription: 'OK',
      headers: {
        'access-control-allow-origin': [{ key: 'Access-Control-Allow-Origin', value: '*' }],
        'access-control-allow-methods': [{ key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' }],
        'access-control-allow-headers': [{ key: 'Access-Control-Allow-Headers', value: '*' }],
        'access-control-max-age': [{ key: 'Access-Control-Max-Age', value: '86400' }],
      },
      body: '',
    };
  }

  const regex = /^(\/.*?)(\/(\d+)\/(\d+)\/(\d+)\.pbf)$/;
  const match = request.uri.match(regex);

  if (match) {
    const basePath = match[1];
    const z = match[3];
    const x = match[4];
    const y = match[5];

    const query = new URLSearchParams(request.querystring);
    query.set('response_format', 'pbf');
    query.set('z', z);
    query.set('x', x);
    query.set('y', y);

    request.uri = basePath;
    request.querystring = query.toString();
  }

  // APIキーをヘッダーに追加
  request.headers['ocp-apim-subscription-key'] = [
    { key: 'Ocp-Apim-Subscription-Key', value: '__API_KEY__' },
  ];

  return request;
};
