const axios = require('axios');
const TwilioClient = require('twilio');
exports.handler = async function (context, event, callback) {
  console.log(`🐷 call called.`);
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');

  try {
    // パラメータの取得
    console.dir(event);
    // const body = JSON.parse(event.body);
    const body = event;
    const params = {};
    params.appId = body.app.id || null;
    params.recordId = body.record.$id.value || null;
    params.userId = body.record.userId.value[0]?.code || null;
    params.bossId = body.record['作業者'].value[0]?.code || '';
    params.priority = body.record.priority.value || null;
    params.detail = body.record.detail.value || null;
    params.activity = body.record['ステータス'].value || null;

    console.dir(params);
    // パラメータチェック
    if (Object.keys(params).filter((key) => !params[key]).length > 0) {
      throw new Error('Parameter error.');
    }

    // 超特急で、かつ状態が処理中の案件のみ処理の対象とする
    if (params.priority === '超特急' && params.activity === '処理中') {
      // 承認者の電話番号を取得
      const getMobileNumber = async () => {
        const twilioDomain = context.DOMAIN_NAME;
        const url = `${
          twilioDomain === 'localhost:3000' ? 'http' : 'https'
        }://${twilioDomain}/cybozuApi/get-users`;
        const postData = {
          codes: [params.bossId],
        };
        const result = await axios.post(url, postData);
        console.dir(result.data);
        return result.data.mobilePhones[0];
      };
      let to = await getMobileNumber();
      to = to.replace(/^0/, '+81'); // 0ABJをE.164に変換
      const from = context.FROM_NUMBER;
      console.log(`🐞 to: ${to} from: ${from}`);

      // Twilio Studio フローの呼び出し
      const execFlow = async () => {
        const client = new TwilioClient(context.API_KEY, context.API_SECRET, {
          accountSid: context.ACCOUNT_SID,
        });
        const result = await client.studio
          .flows(context.FLOW_SID)
          .executions.create({
            to,
            from,
            parameters: JSON.stringify(params),
          });
        return;
      };
      await execFlow();
    }

    response.setBody(
      JSON.stringify({
        body: 'OK',
      }),
    );
    callback(null, response);
  } catch (err) {
    console.log(`👺 ERROR: ${err.message}`);
    console.dir(err);
    response.setBody(err.message);
    callback(response);
  }
};
