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

  // APIキーをヘッダーに追加
  request.headers['ocp-apim-subscription-key'] = [
    { key: 'Ocp-Apim-Subscription-Key', value: '__API_KEY__' },
  ];

  console.log('headers:', JSON.stringify(request.headers['ocp-apim-subscription-key']));

  // リクエストするURLをログに出力
  console.log('request:', JSON.stringify(request));


  return request;
};
