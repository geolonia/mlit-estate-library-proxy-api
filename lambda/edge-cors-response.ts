export const handler = async (event: any): Promise<any> => {
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  // デバッグ用ログ（CloudWatch に出る）
  console.log('[origin-response] CORS headers added');

  headers['access-control-allow-origin'] = [
    { key: 'Access-Control-Allow-Origin', value: '*' }
  ];
  headers['access-control-allow-methods'] = [
    { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' }
  ];
  headers['access-control-allow-headers'] = [
    { key: 'Access-Control-Allow-Headers', value: '*' }
  ];

  return response;
};
