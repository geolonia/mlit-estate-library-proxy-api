# MLIT Estate Library Proxy API

国交省の [不動産情報ライブラリ](https://www.reinfolib.mlit.go.jp/) のデータを Mapbox / MapLibre GL JS で表示するためのプロキシ API です。

Mapbox / Maplibre GL JS でソースを以下のように指定することで、Web地図上に不動産情報ライブラリの地図タイルを表示できます。

CodePenデモ: https://codepen.io/geolonia/pen/MYYgwEJ

```
map.addSource("landprice", {
  type: "vector",
  tiles: [
    "https://du6jhqfvlioa4.cloudfront.net/ex-api/external/XPT001/{z}/{x}/{y}.pbf?from=20223&to=20234"
  ],
});


// 表示レイヤを追加
map.addLayer({
  id: "landprice-points",
  type: "circle",
  source: "landprice",
  "source-layer": "hits", // ソースレイヤー名は hits を指定して下さい
  paint: {
    "circle-radius": 10,
    "circle-color": "#ff0000",
    "circle-stroke-width": 1,
    "circle-stroke-color": "#ffffff"
  }
});
```

## 使い方

```https
https://du6jhqfvlioa4.cloudfront.net/<不動産ライブラリAPIの任意のパス>/{z}/{x}/{y}.pbf?<任意のクエリパラメータ>
```
* ソースレイヤー名は `hits` を指定して下さい。
* 不動産ライブラリ [API操作説明](https://www.reinfolib.mlit.go.jp/help/apiManual) で解説されている任意のクエリパラメータを指定できます。

## 開発者向け


### 環境構築

```
$ npm install
$ npm run save:apikey -- <不動産情報ライブラリのAPIキー>
$ cdk bootstrap
```

### デプロイ

```
$ npm run build
$ npm run deploy
```
