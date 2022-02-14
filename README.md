# 2022年3月25日 ジョイゾー共催セミナープログラム

2022年3月25日に実施する、ジョイゾーさんとの共催セミナーで利用するTwilio側のプログラムです。

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

## call.js

- kintoneのワークフローに設定したWebhookを受け取ります。
- 優先度が「超特急」で、ステータスが「処理中」の場合は、以下の処理を行います。
  - Cybozu.com の User APIを使って承認者の電話番号を取得します。
  - Studio Flowを呼び出します。

## Studio Flow

- 承認者に電話をかけます。
- 要件を伝えて、承認か否認かを確認します。
- 否認の場合にはその理由を聞いて文字にします。
- 結果をFunction（ジョイゾー側で作成）に渡します。
