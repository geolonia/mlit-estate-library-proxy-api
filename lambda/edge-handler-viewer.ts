export const handler = async (event: any): Promise<any> => {
  const request = event.Records[0].cf.request;

  // URI例: /ex-api/external/XPT001/12/1234/4567.pbf
  const regex = /\/(\d+)\/(\d+)\/(\d+)\.pbf$/;
  const match = request.uri.match(regex);

  if (match) {
    const z = parseInt(match[1], 10);

    if (z < 13) {
      return {
        status: '404',
        statusDescription: 'Not Found',
        body: 'Zoom level too low',
        headers: {
          'content-type': [{ key: 'Content-Type', value: 'text/plain' }],
          'cache-control': [{ key: 'Cache-Control', value: 'no-store' }],
        },
      };
    }
  }

  // 通常処理へ進む
  return request;
};
