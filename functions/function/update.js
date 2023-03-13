const { KintoneRestAPIClient } = require('@kintone/rest-api-client');
exports.handler = async function (context, event, callback) {
  const { CYBOZU_API_TOKEN, CYBOZU_SUB_DOMAIN } = context;
  const client = new KintoneRestAPIClient({
    baseUrl: `https://${CYBOZU_SUB_DOMAIN}.cybozu.com`,
    auth: {
      apiToken: CYBOZU_API_TOKEN,
    },
  });
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  try {
    console.log(event);
    const body = event;
    const appId = body.appId || 40;
    const recordId = body.recordId || 1;
    const userId = body.userId || 'bb';
    const status = body.status == '0' ? '承認' : '否認';
    const reason = body.reason || `認めない！`;

    if (status === '否認') {
      // 否認内容をコメントする処理
      console.log('🐞 addRecordComment');
      await client.record.addRecordComment({
        app: appId,
        record: recordId,
        comment: {
          text: `申請が否認されました。メッセージをご確認ください。\n=====\n\n${reason}`,
          mentions: [
            {
              code: userId,
              type: 'USER',
            },
          ],
        },
      });
    }
    // レコードの作業者を空にする処理
    console.log('🐞 updateRecordAssignees');
    await client.record.updateRecordAssignees({
      app: appId,
      id: recordId,
      assignees: [],
    });

    // ステータスを更新する処理
    console.log('🐞 updateRecordStatus');
    await client.record.updateRecordStatus({
      app: appId,
      id: recordId,
      action: status,
    });

    response.setBody(
      JSON.stringify({
        body: 'OK',
      }),
    );
    callback(null, response);
  } catch (err) {
    console.log(err);
    response.setBody(err.message);
    callback(null, response);
  }
};
