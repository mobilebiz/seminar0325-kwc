const axios = require('axios');
const TwilioClient = require('twilio');
exports.handler = async function (context, event, callback) {
  console.log(`ð· call called.`);
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');

  try {
    // ãã©ã¡ã¼ã¿ã®åå¾
    console.dir(event);
    // const body = JSON.parse(event.body);
    const body = event;
    const params = {};
    params.appId = body.app.id || null;
    params.recordId = body.record.$id.value || null;
    params.userId = body.record.userId.value[0].code || null;
    params.bossId = body.record['ä½æ¥­è'].value[0].code || null;
    params.priority = body.record.priority.value || null;
    params.detail = body.record.detail.value || null;
    params.activity = body.record['ã¹ãã¼ã¿ã¹'].value || null;

    console.dir(params);
    // ãã©ã¡ã¼ã¿ãã§ãã¯
    if (Object.keys(params).filter((key) => !params[key]).length > 0) {
      throw new Error('Parameter error.');
    }

    // è¶ç¹æ¥ã§ããã¤ç¶æãå¦çä¸­ã®æ¡ä»¶ã®ã¿å¦çã®å¯¾è±¡ã¨ãã
    if (params.priority === 'è¶ç¹æ¥' && params.activity === 'å¦çä¸­') {
      // æ¿èªèã®é»è©±çªå·ãåå¾
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
      to = to.replace(/^0/, '+81'); // 0ABJãE.164ã«å¤æ
      const from = context.FROM_NUMBER;
      console.log(`ð to: ${to} from: ${from}`);

      // Twilio Studio ãã­ã¼ã®å¼ã³åºã
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
    console.log(`ðº ERROR: ${err.message}`);
    console.dir(err);
    response.setBody(err.message);
    callback(response);
  }
};
