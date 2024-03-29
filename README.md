# kintone ワークフロー承認

kintone のワークフローで「超特急」で承認を依頼した場合に、上司に電話がかかって電話で承認を依頼できるプログラムです。

## 利用環境

### kintone

twilio.cybozu.com の中のワークフローアプリで実装しています。  
アプリへのリンクは[こちら](https://twilio.cybozu.com/k/40/)  
アプリの Webhook を使って、Functions（function/call）を呼び出すようにしています。

### Twilio

プロジェクト「KWC_Sales-Demo」のサブアカウント「全イベント用統一アカウント」内で管理しています。  
API Key/Secret、発信用の電話番号が必要です。  
Studio フローも使います。

## ファイル構成

```:
.
├── README.md                   このファイル
├── __tests__
│   └── cybozuApi
│       └── get-users.test.js   get-usersのユニットテストコード
├── assets
├── flowUpdate.sh               Studio Flowを更新するバッチ（npm run deploy:flow）
├── flows
│   └── call.json               RestAPIで呼ばれ、架電と応答のやり取りを行い、最後にFunctionを呼ぶフロー
├── functions
│   ├── cybozuApi
│   │   └── get-users.js        Cybozu.comのUser APIし、承認者の情報を取得
│   └── function
│       └── call.js             kintoneのWebhookを受け取り、処理を行う
├── node_modules
├── package-lock.json
└── package.json
```

### call.js

- kintone のワークフローに設定した Webhook を受け取ります。
- 優先度が「超特急」で、ステータスが「処理中」の場合は、以下の処理を行います。
  - Cybozu.com の User API を使って承認者の電話番号を取得します。
  - Studio Flow を呼び出します。

### Studio Flow

- 承認者に電話をかけます。
- 要件を伝えて、承認か否認かを確認します。
- 否認の場合にはその理由を聞いて文字にします。
- 結果を Function（ジョイゾー側で作成）に渡します。

## セットアップ

### Twilio アカウントの作成

- [こちら](https://cloudapi.kddi-web.com/signup)から Twilio のアカウントを作成します。
- 日本の電話番号（050 番号）を取得するためには、[取引時確認](https://cloudapi.zendesk.com/hc/ja/articles/900004816703-%E5%8F%96%E5%BC%95%E6%99%82%E7%A2%BA%E8%AA%8D%E3%81%AE%E5%85%A8%E4%BD%93%E7%9A%84%E3%81%AA%E6%89%8B%E7%B6%9A%E3%81%8D%E3%81%AE%E6%B5%81%E3%82%8C%E3%82%92%E6%95%99%E3%81%88%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84-%E6%B3%95%E4%BA%BA%E3%81%AE%E3%81%8A%E5%AE%A2%E6%A7%98-)と[Bundles 登録](https://cloudapi.zendesk.com/hc/ja/articles/4409702306201--Bundle-%E3%81%AE%E4%BD%9C%E6%88%90%E3%81%8A%E3%82%88%E3%81%B3%E6%89%BF%E8%AA%8D%E7%94%B3%E8%AB%8B%E6%96%B9%E6%B3%95)が必須となります。
- 作成されたアカウントを使って、Twilio の管理コンソールにログインし、API Key と API Secret を作成してください。作成した API Key と API Secret はこのあと使うのでメモ帳に控えておいてください。

### Twilio CLI のセットアップ

Node.js(v.14.0 以降)と、npm がインストールされていること。

- [こちらの記事](https://qiita.com/mobilebiz/items/456ce8b455f6aa84cc1e)を参考に、Twilio CLI のインストールを行います。
- [こちらの記事](https://qiita.com/mobilebiz/items/fb4439bf162098e345ae)を参考に、Serverless Plugins のインストールを行います。

### プログラムのセットアップ

```sh
% git clone https://github.com/mobilebiz/seminar0325-kwc.git
% cd seminar0325-kwc
% npm install
```

### Studio フローのセットアップ

```sh
% sh flowCreate.sh
SID                                 Friendly Name  Status     Revision
FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  承認コール       published  1
```

表示された FW から始まる文字列（Studio フローの SID）をメモ帳にコピーしておきます。

### 環境変数（.env）の更新

コピーした`.env`をエディタで開き、以下の内容を更新します。

| 変数名            | 内容                                                              |
| :---------------- | :---------------------------------------------------------------- |
| ACCOUNT_SID       | AC から始まる Twilio の AccountSid                                |
| AUTH_TOKEN        | 変更の必要はありません                                            |
| API_KEY           | 先ほど作成した SK から始まる Twilio の API キー                   |
| API_SECRET        | 同じく、API キーとセットの API シークレット                       |
| FLOW_SID          | 先程控えておいた FW から始まる Studio フローの SID                |
| FROM_NUMBER       | 購入した Twilio の 050 番号(先頭の 0 を+81 に置き換えて記載)      |
| UPDATE_URL        | ジョイゾー側で作成した承認結果を反映させるための Functions の URL |
| CYBOZU_SUB_DOMAIN | ジョイゾー側で作成した kintone アプリのドメイン                   |
| CYBOZU_USER_ID    | cybozu.com の API をコールするための管理者 ID                     |
| CYBOZU_USER_PASS  | 同じくパスワード                                                  |

## デプロイ

```sh
% twilio serverless:deploy --production
```
