import { CloudFrontRequestEvent, CloudFrontRequest } from 'aws-lambda';

export const handler = async (event: CloudFrontRequestEvent): Promise<CloudFrontRequest> => {
  const request = event.Records[0].cf.request;

  // URI のパターン例: /<任意のパス>/13/7312/3008.pbf
  // 正規表現で、先頭部分（任意のパス）と末尾のタイル座標部分をキャプチャ
  const regex = /^(\/.*?)(\/(\d+)\/(\d+)\/(\d+)\.pbf)$/;
  const match = request.uri.match(regex);

  if (match) {
    // match[1] : 任意のパス部分（"/<任意のパス>"）
    // match[3] : z, match[4] : x, match[5] : y
    const arbitraryPath = match[1] || '/';
    const z = match[3];
    const x = match[4];
    const y = match[5];

    // クエリパラメータをパース
    const queryParams = new URLSearchParams(request.querystring);
    // タイル情報をクエリパラメータに設定
    queryParams.set('response_format', 'pbf');
    queryParams.set('z', z);
    queryParams.set('x', x);
    queryParams.set('y', y);

    // オリジンへ送る URI は、任意のパス部分のみを使用（後ろの /13/7312/3008.pbf は削除）
    request.uri = arbitraryPath;
    request.querystring = queryParams.toString();
  }

  // 環境変数から API キーを取得し、ヘッダーに追加
  const apiKey = process.env.API_KEY;
  if (apiKey) {
    request.headers['ocp-apim-subscription-key'] = [
      { key: 'Ocp-Apim-Subscription-Key', value: apiKey },
    ];
  }

  return request;
};
