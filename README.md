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
https://du6jhqfvlioa4.cloudfront.net/ex-api/external/<API ID>/{z}/{x}/{y}.pbf?<クエリパラメータ>
```
* `<API ID>` には不動産情報ライブラリのタイル形式の API（`XPT001` などの `XPT`・`XKT`・`XGT`・`XST` で始まるもの）を指定できます。
* `{z}` は 9〜15 を指定できます。API ごとの対応範囲は [API操作説明](https://www.reinfolib.mlit.go.jp/help/apiManual) を参照して下さい。
* ソースレイヤー名は `hits` を指定して下さい。
* クエリパラメータには、[API操作説明](https://www.reinfolib.mlit.go.jp/help/apiManual) でその API について解説されている絞り込み用のパラメータ（`XPT001` の `from`、`to` など）を指定できます。`response_format`、`z`、`x`、`y` はプロキシが設定するので指定しないで下さい。
* タイル形式ではない API（`XIT001`、`XIT002`、`XCT001`）、API操作説明に載っていない API ID、上記以外のパス、その API について解説されていないクエリパラメータには 403 を返します。

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
