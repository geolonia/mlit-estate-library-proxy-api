# MLIT Estate Library Proxy API

不動産情報ライブラリを Mapbox / MapLibre GL JS で表示するためのプロキシ API です。

Mapbox / Maplibre GL JS でソースを以下のように指定することで、Web地図上に不動産情報ライブラリの地図タイルを表示できます。

```
tiles: ["https://<CloudFrontドメイン>/<不動産ライブラリAPIのパス>/{z}/{x}/{y}.pbf?from=20223&to=20234"]

例：不動産価格（取引価格・成約価格）情報のポイントを表示する場合
tiles: ["https://<CloudFrontドメイン>/ex-api/external/XPT001/{z}/{x}/{y}.pbf?from=20223&to=20234"]
```

## 開発者向け


### 環境構築

```
$ npm install
$ npm run save:apikey -- <不動産情報ライブラリのAPIキー>
```

### デプロイ

```
$ npm run build
$ npm run deploy
```
