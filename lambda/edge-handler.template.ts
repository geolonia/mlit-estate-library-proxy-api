// lambda/edge-handler.template.ts

export const handler = async (event: any): Promise<any> => {
  const request = event.Records[0].cf.request;

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

  request.headers['ocp-apim-subscription-key'] = [
    { key: 'Ocp-Apim-Subscription-Key', value: '__API_KEY__' } // ← プレースホルダ
  ];

  return request;
};
