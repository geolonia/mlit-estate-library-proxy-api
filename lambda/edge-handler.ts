// lambda/edge-handler.template.ts

export const handler = async (event: any): Promise<any> => {
  const request = event.Records[0].cf.request;

  console.log('[viewer-request1] incoming querystring:', request);

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

  console.log('[viewer-request2] rewrite querystring:', request);

  return request;
};
