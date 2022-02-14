const axios = require('axios');

const fetchData = async (data) => {
  return await axios.post('http://localhost:3000/cybozuApi/get-users', data);
};

test('全ユーザーの取得', () => {
  return fetchData({
    codes: [],
  }).then((res) => {
    expect(res.status).toBe(200);
    const mobilePhones = res.data.mobilePhones || [];
    expect(mobilePhones.length).toBe(3);
  });
});

test('特定ユーザーの取得', () => {
  return fetchData({
    codes: ['katsumi@gij.com'],
  }).then((res) => {
    expect(res.status).toBe(200);
    const mobilePhones = res.data.mobilePhones || [];
    expect(mobilePhones.length).toBe(1);
    expect(mobilePhones[0]).toBe('09045327751');
  });
});
