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

  // 転送するのはタイル API（XPT/XKT/XGT/XST）の {z}/{x}/{y}.pbf 形式だけ
  // それ以外はAPIキーを付ける前に拒否する
  const regex = /^\/ex-api\/external\/(X[A-Z]T\d{3})\/(0|[1-9]\d*)\/(0|[1-9]\d*)\/(0|[1-9]\d*)\.pbf$/;
  const match = request.uri.match(regex);
  const allowedQueryParams = match && TILE_API_QUERY_PARAMS[match[1]];

  if (!match || !allowedQueryParams) {
    return forbidden();
  }

  const basePath = `/ex-api/external/${match[1]}`;
  const z = match[2];
  const x = match[3];
  const y = match[4];

  // 上流が配信するズームレベルは全 API を通して 9〜15
  const zoom = Number(z);
  if (zoom < 9 || zoom > 15 || Number(x) >= 2 ** zoom || Number(y) >= 2 ** zoom) {
    return forbidden();
  }

  // クエリ文字列はキャッシュキーに含まれるので、API操作説明でその API に載っているものだけ受け付ける
  const query = new URLSearchParams(request.querystring);
  for (const key of query.keys()) {
    if (!allowedQueryParams.includes(key)) {
      return forbidden();
    }
  }

  query.set('response_format', 'pbf');
  query.set('z', z);
  query.set('x', x);
  query.set('y', y);

  request.uri = basePath;
  request.querystring = query.toString();

  // APIキーをヘッダーに追加
  request.headers['ocp-apim-subscription-key'] = [
    { key: 'Ocp-Apim-Subscription-Key', value: '__API_KEY__' },
  ];

  return request;
};

// タイル API ごとの絞り込み用パラメータ（response_format, z, x, y はプロキシが設定する）
// https://www.reinfolib.mlit.go.jp/help/apiManual/
const TILE_API_QUERY_PARAMS: Record<string, string[]> = {
  XPT001: ['from', 'to', 'priceClassification', 'landTypeCode'],
  XPT002: ['year', 'priceClassification', 'useCategoryCode'],
  XKT001: [],
  XKT002: [],
  XKT003: [],
  XKT004: ['administrativeAreaCode'],
  XKT005: ['administrativeAreaCode'],
  XKT006: [],
  XKT007: [],
  XKT010: [],
  XKT011: ['administrativeAreaCode', 'welfareFacilityClassCode', 'welfareFacilityMiddleClassCode', 'welfareFacilityMinorClassCode'],
  XKT013: [],
  XKT014: [],
  XKT015: [],
  XKT016: ['administrativeAreaCode'],
  XKT017: ['administrativeAreaCode'],
  XKT018: [],
  XKT019: ['prefectureCode', 'districtCode'],
  XKT020: [],
  XKT021: ['prefectureCode', 'administrativeAreaCode'],
  XKT022: ['prefectureCode', 'administrativeAreaCode'],
  XKT023: [],
  XKT024: [],
  XKT025: [],
  XKT026: [],
  XKT027: [],
  XKT028: [],
  XKT029: [],
  XKT030: [],
  XKT031: ['administrativeAreaCode'],
  XGT001: [],
  XST001: ['disastertype_code'],
};

const forbidden = () => ({
  status: '403',
  statusDescription: 'Forbidden',
  headers: {
    'content-type': [{ key: 'Content-Type', value: 'text/plain' }],
  },
  body: 'Forbidden',
});
