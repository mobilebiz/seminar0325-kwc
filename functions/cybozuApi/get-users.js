const fetch = require('node-fetch');
exports.handler = async function (context, event, callback) {
  console.log(`🐷 get-users called.`);
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');

  try {
    // パラメータ
    const { codes = [] } = event; // codesは検索するユーザーログインIDの配列（例：['katsumi@gij.com', 'taro.yamada']）

    // 認証情報
    const AUTH = Buffer.from(
      `${context.CYBOZU_USER_ID}:${context.CYBOZU_USER_PASS}`,
    ).toString('base64');

    let mobilePhones = [];
    // codesをクエリーに分解
    let query = '';
    codes.forEach((code, idx) => {
      query += `codes[${idx}]=${code}&`;
    });
    query += 'offset=0&size=10';

    // ユーザーエクスポートAPIを使ってリストを取得
    fetch(
      `https://${context.CYBOZU_SUB_DOMAIN}.cybozu.com/v1/users.json?${query}`,
      {
        method: 'GET',
        headers: {
          'X-Cybozu-Authorization': AUTH,
          Authorization: `Basic ${AUTH}`,
        },
      },
    )
      .then((res) => res.json())
      .then((json) => {
        json.users.forEach((user) => {
          if (user.mobilePhone) mobilePhones.push(user.mobilePhone);
        });
        response.setBody(
          JSON.stringify({
            mobilePhones,
          }),
        );
        callback(null, response);
      });
  } catch (err) {
    console.log(`👺 ERROR: ${err.message}`);
    console.dir(err);
    response.setBody(err.message);
    callback(response);
  }
};
